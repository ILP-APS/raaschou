import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const EREGNSKAB_BASE = "https://publicapi.e-regnskab.dk";

// Work type → category mapping
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
    console.error(`e-regnskab ${path} failed [${res.status}]: ${text}`);
    return null;
  }
  return res.json();
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

    // 1. Fetch appointments + work lines in parallel (both are bulk calls)
    console.log("Fetching data from e-regnskab...");
    const [appointments, workLines, users] = await Promise.all([
      eregnskabFetch("/Appointment/Standard?open=true", EREGNSKAB_API_KEY),
      eregnskabFetch("/Appointment/Standard/Line/Work", EREGNSKAB_API_KEY),
      eregnskabFetch("/User", EREGNSKAB_API_KEY),
    ]);

    if (!appointments) throw new Error("Failed to fetch appointments");
    console.log(`Fetched ${appointments.length} appointments, ${workLines?.length || 0} work lines`);

    // Build user initials map
    const userMap = new Map<number, string>();
    if (users) {
      for (const u of users) {
        userMap.set(u.hnUserID, u.initials || u.name || `User ${u.hnUserID}`);
      }
    }

    // Group work lines by appointment ID
    const workByAppointment = new Map<number, { projektering: number; produktion: number; montage: number; total: number }>();
    if (workLines) {
      for (const line of workLines) {
        const appId = line.hnAppointmentID;
        if (!appId) continue;
        if (!workByAppointment.has(appId)) {
          workByAppointment.set(appId, { projektering: 0, produktion: 0, montage: 0, total: 0 });
        }
        const hours = workByAppointment.get(appId)!;
        const units = line.units || 0;
        const category = workTypeCategoryMap[line.hnWorkTypeID];
        if (category) hours[category] += units;
        hours.total += units;
      }
    }

    const now = new Date().toISOString();
    let upserted = 0;
    let errors = 0;

    // Process in batches of 10 concurrent upserts
    const batchSize = 10;
    for (let i = 0; i < appointments.length; i += batchSize) {
      const batch = appointments.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map(async (apt: any) => {
          const appId = apt.hnAppointmentID;
          const appointmentNumber = apt.appointmentNumber;
          const initials = userMap.get(apt.responsibleHnUserID) || `${apt.responsibleHnUserID}`;
          const hours = workByAppointment.get(appId) || { projektering: 0, produktion: 0, montage: 0, total: 0 };

          const { error } = await supabase.rpc("upsert_project", {
            p_id: appointmentNumber,
            p_name: apt.subject || "",
            p_responsible_person_initials: initials,
            p_offer_amount: 0,
            p_assembly_amount: 0,
            p_subcontractor_amount: 0,
            p_hours_used_projecting: hours.projektering,
            p_hours_used_production: hours.produktion,
            p_hours_used_assembly: hours.montage,
            p_materials_amount: 0,
            p_hours_estimated_projecting: 0,
            p_hours_estimated_production: 0,
            p_hours_estimated_assembly: 0,
            p_hours_used_total: hours.total,
            p_hours_remaining_projecting: 0,
            p_hours_remaining_production: 0,
            p_hours_remaining_assembly: 0,
            p_allocated_freight_amount: 0,
            p_last_api_update: now,
          });

          if (error) throw error;
          return appointmentNumber;
        })
      );

      for (const r of results) {
        if (r.status === "fulfilled") upserted++;
        else {
          console.error("Upsert error:", r.reason);
          errors++;
        }
      }
    }

    console.log(`Sync complete: ${upserted} upserted, ${errors} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        appointments_fetched: appointments.length,
        projects_upserted: upserted,
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
