import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const EREGNSKAB_BASE = "https://publicapi.e-regnskab.dk";

const workTypeCategoryMap: Record<number, "projektering" | "produktion" | "montage"> = {
  3585: "projektering", 4326: "projektering", 6759: "projektering", 11591: "projektering",
  3568: "produktion", 3576: "produktion", 3578: "produktion", 3579: "produktion",
  3580: "produktion", 3581: "produktion", 3583: "produktion", 3584: "produktion",
  4306: "produktion", 4413: "produktion", 4414: "produktion", 4449: "produktion",
  5065: "produktion", 5712: "produktion", 5732: "produktion", 6973: "produktion", 9301: "produktion",
  3577: "montage", 4307: "montage",
};

async function eregnskabFetch(path: string, apiKey: string) {
  const res = await fetch(`${EREGNSKAB_BASE}${path}`, {
    headers: { accept: "application/json", ApiKey: apiKey },
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`e-regnskab ${path} failed [${res.status}]: ${text.substring(0, 200)}`);
    return null;
  }
  return res.json();
}

async function fetchOfferLineItems(apiKey: string): Promise<any[]> {
  const allLines: any[] = [];
  const currentYear = new Date().getFullYear();
  const chunks: string[] = [];
  for (let year = currentYear; year >= currentYear - 2; year--) {
    chunks.push(`from=${year}-01-01&to=${year}-12-31`);
  }
  const results = await Promise.allSettled(
    chunks.map(q => eregnskabFetch(`/Offer/Standard/Line/Item?${q}`, apiKey))
  );
  for (const r of results) {
    if (r.status === "fulfilled" && r.value) {
      allLines.push(...r.value);
    }
  }
  return allLines;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth: require valid JWT
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }
  const sbAuth = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authError } = await sbAuth.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }

  try {
    const EREGNSKAB_API_KEY = Deno.env.get("EREGNSKAB_API_KEY");
    if (!EREGNSKAB_API_KEY) throw new Error("EREGNSKAB_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 0. Fetch calculation settings
    const { data: settingsRows, error: settingsError } = await supabase
      .from("settings")
      .select("key, value");
    if (settingsError) throw new Error("Failed to fetch settings: " + settingsError.message);

    const settingsMap: Record<string, number> = {};
    for (const row of settingsRows || []) {
      settingsMap[row.key] = Number(row.value);
    }
    const S = {
      material_share: settingsMap.material_share ?? 0.25,
      average_hourly_rate: settingsMap.average_hourly_rate ?? 750,
      assembly_hourly_rate: settingsMap.assembly_hourly_rate ?? 630,
      projecting_share: settingsMap.projecting_share ?? 0.10,
      projecting_hourly_rate: settingsMap.projecting_hourly_rate ?? 830,
      freight_share: settingsMap.freight_share ?? 0.08,
      min_offer_amount: settingsMap.min_offer_amount ?? 25000,
    };
    console.log("Settings loaded:", S);

    // 1. Fetch all data in parallel
    const now = new Date();
    const fromDate = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
    const fromDateStr = fromDate.toISOString().split('T')[0];
    console.log(`Fetching data from e-regnskab (from ${fromDateStr})...`);
    const [appointments, workLines, users, offerLineItems] = await Promise.all([
      eregnskabFetch(`/Appointment/Standard?open=true&from=${fromDateStr}`, EREGNSKAB_API_KEY),
      eregnskabFetch(`/Appointment/Standard/Line/Work?from=${fromDateStr}`, EREGNSKAB_API_KEY),
      eregnskabFetch("/User", EREGNSKAB_API_KEY),
      fetchOfferLineItems(EREGNSKAB_API_KEY),
    ]);

    if (!appointments) throw new Error("Failed to fetch appointments");
    console.log(`Fetched ${appointments.length} appointments, ${workLines?.length || 0} work lines, ${offerLineItems.length} offer line items`);

    // Build user initials map
    const userMap = new Map<number, string>();
    if (users) {
      for (const u of users) {
        userMap.set(u.hnUserID, u.initials || u.name || `User ${u.hnUserID}`);
      }
    }

    const openAppointmentIds = new Set<number>(appointments.map((a: any) => a.hnAppointmentID));

    // Group work lines by appointment ID
    const workByAppointment = new Map<number, { projektering: number; produktion: number; montage: number; total: number }>();
    if (workLines) {
      for (const line of workLines) {
        const appId = line.hnAppointmentID;
        if (!appId) continue;
        if (!workByAppointment.has(appId)) {
          workByAppointment.set(appId, { projektering: 0, produktion: 0, montage: 0, total: 0 });
        }
        const h = workByAppointment.get(appId)!;
        const units = line.units || 0;
        const cat = workTypeCategoryMap[line.hnWorkTypeID];
        if (cat) h[cat] += units;
        h.total += units;
      }
    }

    const isSubAppointment = (num: string) => /^\d+-\d+$/.test(num);

    // Map appointmentNumber → hnAppointmentID for parent-lookup.
    // Only open appointments are in this map; subs whose parent is closed (not in set)
    // are handled as orphans — frontend already generates a placeholder parent row.
    const numberToAppointmentId = new Map<string, number>();
    for (const apt of appointments) {
      numberToAppointmentId.set(String(apt.appointmentNumber), apt.hnAppointmentID);
    }

    // Roll sub-hours up into parent when parent is open. Sub's own bucket is untouched
    // so the sub row can still render its individual hours below.
    for (const apt of appointments) {
      const num = String(apt.appointmentNumber);
      if (!isSubAppointment(num)) continue;
      const parentNum = num.split("-")[0];
      const parentApptId = numberToAppointmentId.get(parentNum);
      if (!parentApptId) continue; // orphan — no parent to roll up into
      const subHours = workByAppointment.get(apt.hnAppointmentID);
      if (!subHours) continue;
      if (!workByAppointment.has(parentApptId)) {
        workByAppointment.set(parentApptId, { projektering: 0, produktion: 0, montage: 0, total: 0 });
      }
      const p = workByAppointment.get(parentApptId)!;
      p.projektering += subHours.projektering;
      p.produktion += subHours.produktion;
      p.montage += subHours.montage;
      p.total += subHours.total;
    }

    // Build hnOfferID → appointmentID map
    const offerToAppointment = new Map<number, number>();
    for (const apt of appointments) {
      if (apt.hnOfferID) {
        offerToAppointment.set(apt.hnOfferID, apt.hnAppointmentID);
      }
    }

    // Group offer line items by appointment → offer_amount, assembly_amount, subcontractor_amount
    const offerByAppointment = new Map<number, { total: number; assembly: number; subcontractor: number }>();
    for (const line of offerLineItems) {
      const offerID = line.hnOfferID;
      const appId = offerToAppointment.get(offerID);
      if (!appId || !openAppointmentIds.has(appId)) continue;
      if (!offerByAppointment.has(appId)) {
        offerByAppointment.set(appId, { total: 0, assembly: 0, subcontractor: 0 });
      }
      const bucket = offerByAppointment.get(appId)!;
      const amount = line.totalPriceStandardCurrency || 0;
      bucket.total += amount;
      if (line.itemNumber === "Montage") bucket.assembly += amount;
      if (line.itemNumber === "UE") bucket.subcontractor += amount;
    }

    console.log(`Offer line items grouped for ${offerByAppointment.size} open appointments`);

    // Fetch existing manual values (these are user-entered and must be preserved)
    const { data: existingManualData } = await supabase
      .from("projects")
      .select("id, manual_assembly_amount, manual_subcontractor_amount, completion_percentage_manual, completion_percentage_previous");

    const manualDataMap = new Map<string, {
      manual_assembly_amount: number | null;
      manual_subcontractor_amount: number | null;
      completion_percentage_manual: number | null;
      completion_percentage_previous: number | null;
    }>();
    if (existingManualData) {
      for (const row of existingManualData) {
        manualDataMap.set(row.id, {
          manual_assembly_amount: row.manual_assembly_amount,
          manual_subcontractor_amount: row.manual_subcontractor_amount,
          completion_percentage_manual: row.completion_percentage_manual,
          completion_percentage_previous: row.completion_percentage_previous,
        });
      }
    }

    const nowISO = new Date().toISOString();

    // 2. Build and FILTER project rows
    const allProjectRows = appointments.map((apt: any) => {
      const appId = apt.hnAppointmentID;
      const initials = userMap.get(apt.responsibleHnUserID) || `${apt.responsibleHnUserID}`;
      const appointmentNumber = String(apt.appointmentNumber);
      const isSub = isSubAppointment(appointmentNumber);

      if (isSub) {
        // Sub rows: own hours only (K/L/M/N). All other numeric fields null so the UI
        // renders "-" and conditional colors are suppressed. Hours were rolled up into
        // the parent bucket above; the sub's own bucket was not mutated.
        const hours = workByAppointment.get(appId) || { projektering: 0, produktion: 0, montage: 0, total: 0 };
        const L = hours.total - hours.montage - hours.projektering;
        return {
          id: appointmentNumber,
          name: apt.subject || "",
          responsible_person_initials: initials,
          offer_amount: null,
          assembly_amount: null,
          subcontractor_amount: null,
          materials_amount: null,
          hours_estimated_projecting: null,
          hours_estimated_production: null,
          hours_estimated_assembly: null,
          hours_used_projecting: hours.projektering,
          hours_used_production: L,
          hours_used_assembly: hours.montage,
          hours_used_total: hours.total,
          hours_remaining_projecting: null,
          hours_remaining_production: null,
          hours_remaining_assembly: null,
          hours_estimated_by_completion: null,
          plus_minus_hours: null,
          allocated_freight_amount: null,
          last_api_update: nowISO,
          _is_sub: true,
        };
      }

      // Parent row — workByAppointment[appId] now includes rolled-up sub hours.
      const hours = workByAppointment.get(appId) || { projektering: 0, produktion: 0, montage: 0, total: 0 };
      const offerData = offerByAppointment.get(appId) || { total: 0, assembly: 0, subcontractor: 0 };
      const manual = manualDataMap.get(appointmentNumber);

      const D = offerData.total;
      const E = (offerData.assembly ?? 0) + (manual?.manual_assembly_amount ?? 0);
      const F = (offerData.subcontractor ?? 0) + (manual?.manual_subcontractor_amount ?? 0);
      const K = hours.projektering;
      const M = hours.montage;
      const N = hours.total;
      const Q = manual?.completion_percentage_manual ?? 0;

      const G = (D - E - F) * S.material_share;
      const H = (D - E - F) * S.projecting_share / S.projecting_hourly_rate;
      const I_val = (D - E - G - F) / S.average_hourly_rate - H;
      const J = (E - E * S.freight_share) / S.assembly_hourly_rate;
      const L = N - M - K;
      const O_val = H - K;
      const P = I_val - L;
      const S_val = I_val * Q;
      const T = -L + S_val;
      const U = J - M;
      const V = S.freight_share * E;

      return {
        id: appointmentNumber,
        name: apt.subject || "",
        responsible_person_initials: initials,
        offer_amount: D,
        assembly_amount: offerData.assembly,
        subcontractor_amount: offerData.subcontractor,
        hours_used_projecting: K,
        hours_used_assembly: M,
        hours_used_total: N,
        materials_amount: G,
        hours_estimated_projecting: H,
        hours_estimated_production: I_val,
        hours_estimated_assembly: J,
        hours_used_production: L,
        hours_remaining_projecting: O_val,
        hours_remaining_production: P,
        hours_estimated_by_completion: S_val,
        plus_minus_hours: T,
        hours_remaining_assembly: U,
        allocated_freight_amount: V,
        last_api_update: nowISO,
        _is_sub: false,
      };
    });

    // Filter: include sub-appointments always, otherwise require offer_amount >= S.min_offer_amount
    const projectRows = allProjectRows
      .filter((row) => {
        if (row._is_sub) return true;
        if (row.offer_amount <= 0) return false;
        if (row.offer_amount < S.min_offer_amount) return false;
        return true;
      })
      .map(({ _is_sub, ...rest }) => rest);

    const excludedCount = allProjectRows.length - projectRows.length;
    console.log(`Filtered: ${projectRows.length} included, ${excludedCount} excluded`);

    // 3. Batch upsert projects (chunks of 50)
    let upserted = 0;
    let errors = 0;
    for (let i = 0; i < projectRows.length; i += 50) {
      const batch = projectRows.slice(i, i + 50);
      const { error } = await supabase
        .from("projects")
        .upsert(batch, { onConflict: "id" });
      
      if (error) {
        console.error("Batch upsert error:", error);
        errors += batch.length;
      } else {
        upserted += batch.length;
      }
    }

    // 4. Delete rows for appointments that no longer qualify:
    //    - lukkede aftaler (ikke længere returneret af ?open=true)
    //    - aftaler uden linket tilbud (offer_amount = 0)
    //    - aftaler med tilbud under 25.000 kr
    const validIds = new Set(projectRows.map((r) => r.id));
    const { data: existingRows } = await supabase
      .from("projects")
      .select("id");

    const idsToDelete = (existingRows ?? [])
      .map((r) => r.id)
      .filter((id) => !validIds.has(id));

    let deleted = 0;
    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("projects")
        .delete()
        .in("id", idsToDelete);

      if (deleteError) {
        console.error("Delete stale rows error:", deleteError);
      } else {
        deleted = idsToDelete.length;
        console.log(`Deleted ${deleted} stale project(s): ${idsToDelete.join(", ")}`);
      }
    }

    console.log(`Sync complete: ${upserted} upserted, ${deleted} deleted, ${errors} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        appointments_fetched: appointments.length,
        projects_upserted: upserted,
        projects_deleted: deleted,
        offer_line_items_fetched: offerLineItems.length,
        errors,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Sync error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
