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

async function fetchItemLinesInChunks(apiKey: string): Promise<any[]> {
  const allLines: any[] = [];
  const currentYear = new Date().getFullYear();
  // Use 6-month chunks for recent years to avoid API timeouts
  const chunks: string[] = [];
  for (let year = currentYear; year >= currentYear - 2; year--) {
    chunks.push(`from=${year}-01-01&to=${year}-06-30`);
    chunks.push(`from=${year}-07-01&to=${year}-12-31`);
  }
  
  const results = await Promise.allSettled(
    chunks.map(q => eregnskabFetch(`/Appointment/Standard/Line/Item?${q}`, apiKey))
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

  try {
    const EREGNSKAB_API_KEY = Deno.env.get("EREGNSKAB_API_KEY");
    if (!EREGNSKAB_API_KEY) throw new Error("EREGNSKAB_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Fetch all data in parallel
    console.log("Fetching data from e-regnskab...");
    const [appointments, workLines, users, itemLines] = await Promise.all([
      eregnskabFetch("/Appointment/Standard?open=true", EREGNSKAB_API_KEY),
      eregnskabFetch("/Appointment/Standard/Line/Work", EREGNSKAB_API_KEY),
      eregnskabFetch("/User", EREGNSKAB_API_KEY),
      fetchItemLinesInChunks(EREGNSKAB_API_KEY),
    ]);

    if (!appointments) throw new Error("Failed to fetch appointments");
    console.log(`Fetched ${appointments.length} appointments, ${workLines?.length || 0} work lines, ${itemLines.length} item lines`);

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

    // Group item lines by appointment ID → offer_amount
    const offerByAppointment = new Map<number, number>();
    for (const line of itemLines) {
      const appId = line.hnAppointmentID;
      if (!appId || !openAppointmentIds.has(appId)) continue;
      offerByAppointment.set(appId, (offerByAppointment.get(appId) || 0) + (line.totalPriceStandardCurrency || 0));
    }

    console.log(`Item lines grouped for ${offerByAppointment.size} open appointments`);

    const now = new Date().toISOString();
    const isSubAppointment = (id: string) => /^\d+-\d+$/.test(id);

    // 2. Build and FILTER project rows
    const allProjectRows = appointments.map((apt: any) => {
      const appId = apt.hnAppointmentID;
      const hours = workByAppointment.get(appId) || { projektering: 0, produktion: 0, montage: 0, total: 0 };
      const offerAmount = offerByAppointment.get(appId) || 0;
      const initials = userMap.get(apt.responsibleHnUserID) || `${apt.responsibleHnUserID}`;
      const appointmentNumber = String(apt.appointmentNumber);

      return {
        id: appointmentNumber,
        name: apt.subject || "",
        responsible_person_initials: initials,
        offer_amount: offerAmount,
        assembly_amount: 0,
        subcontractor_amount: 0,
        hours_used_projecting: hours.projektering,
        hours_used_production: hours.produktion,
        hours_used_assembly: hours.montage,
        materials_amount: 0,
        hours_estimated_projecting: 0,
        hours_estimated_production: 0,
        hours_estimated_assembly: 0,
        hours_used_total: hours.total,
        hours_remaining_projecting: 0,
        hours_remaining_production: 0,
        hours_remaining_assembly: 0,
        allocated_freight_amount: 0,
        last_api_update: now,
        _is_sub: isSubAppointment(appointmentNumber),
      };
    });

    // Filter: include sub-appointments always, otherwise require offer_amount > 25000
    const projectRows = allProjectRows
      .filter((row) => {
        if (row._is_sub) return true;
        if (row.offer_amount <= 0) return false;
        if (row.offer_amount < 25000) return false;
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

    // 4. Clean up projects that no longer match filter criteria
    const validIds = new Set(projectRows.map((r) => r.id));
    const { data: existingProjects } = await supabase
      .from("projects")
      .select("id, offer_amount");
    
    if (existingProjects) {
      const toDelete = existingProjects
        .filter((p) => !validIds.has(p.id))
        .filter((p) => {
          // Only delete if it was API-synced and doesn't match new criteria
          if (isSubAppointment(p.id)) return false;
          if ((p.offer_amount || 0) <= 0) return true;
          if ((p.offer_amount || 0) < 25000) return true;
          return false;
        })
        .map((p) => p.id);

      if (toDelete.length > 0) {
        const { error: delError } = await supabase
          .from("projects")
          .delete()
          .in("id", toDelete);
        if (delError) {
          console.error("Cleanup delete error:", delError);
        } else {
          console.log(`Cleaned up ${toDelete.length} projects below filter threshold`);
        }
      }
    }

    console.log(`Sync complete: ${upserted} upserted, ${errors} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        appointments_fetched: appointments.length,
        projects_upserted: upserted,
        item_lines_fetched: itemLines.length,
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
