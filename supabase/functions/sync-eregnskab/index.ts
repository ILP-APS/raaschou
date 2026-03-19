import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const EREGNSKAB_BASE = "https://publicapi.e-regnskab.dk";

// Work type → category mapping (for hours)
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

    // 1. Fetch bulk data in parallel
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

    // Group work lines by appointment ID → hours
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

    // 2. Fetch item lines and budget lines per appointment in parallel batches
    const appointmentIds = appointments.map((a: any) => a.hnAppointmentID);
    
    // Fetch item lines per appointment (API requires hnAppointmentID param)
    console.log("Fetching item lines and budget lines per appointment...");
    const itemLinesByAppointment = new Map<number, any[]>();
    const amountsByAppointment = new Map<number, { offer_amount: number; materials_amount: number }>();
    const budgetByAppointment = new Map<number, { projektering: number; produktion: number; montage: number }>();

    // Process in batches of 20 concurrent API calls
    const apiBatchSize = 20;
    for (let i = 0; i < appointmentIds.length; i += apiBatchSize) {
      const batchIds = appointmentIds.slice(i, i + apiBatchSize);
      const results = await Promise.allSettled(
        batchIds.flatMap((appId: number) => [
          eregnskabFetch(`/Appointment/Standard/Line/Item?hnAppointmentID=${appId}`, EREGNSKAB_API_KEY)
            .then(lines => ({ type: "items" as const, appId, lines })),
          eregnskabFetch(`/Appointment/Budget/Line?hnAppointmentID=${appId}`, EREGNSKAB_API_KEY)
            .then(lines => ({ type: "budget" as const, appId, lines })),
        ])
      );

      for (const r of results) {
        if (r.status !== "fulfilled" || !r.value.lines) continue;
        const { type, appId, lines } = r.value;

        if (type === "items") {
          // Log first sample
          if (itemLinesByAppointment.size === 0 && lines.length > 0) {
            console.log("Sample item line:", JSON.stringify(lines[0]));
          }
          
          itemLinesByAppointment.set(appId, lines);
          const amounts = { offer_amount: 0, materials_amount: 0 };
          for (const line of lines) {
            const total = line.totalPriceStandardCurrency || 0;
            amounts.offer_amount += total;
            amounts.materials_amount += total;
          }
          amountsByAppointment.set(appId, amounts);
        } else if (type === "budget") {
          // Log first sample
          if (budgetByAppointment.size === 0 && lines.length > 0) {
            console.log("Sample budget line:", JSON.stringify(lines[0]));
          }

          const budget = { projektering: 0, produktion: 0, montage: 0 };
          for (const line of lines) {
            const units = line.units || 0;
            const category = workTypeCategoryMap[line.hnWorkTypeID];
            if (category) budget[category] += units;
          }
          budgetByAppointment.set(appId, budget);
        }
      }
    }

    console.log(`Fetched item lines for ${itemLinesByAppointment.size} appointments, budget lines for ${budgetByAppointment.size} appointments`);

    const now = new Date().toISOString();
    let upserted = 0;
    let errors = 0;
    let lineItemsUpserted = 0;

    // 3. Upsert projects in batches
    const batchSize = 10;
    for (let i = 0; i < appointments.length; i += batchSize) {
      const batch = appointments.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map(async (apt: any) => {
          const appId = apt.hnAppointmentID;
          const appointmentNumber = apt.appointmentNumber;
          const initials = userMap.get(apt.responsibleHnUserID) || `${apt.responsibleHnUserID}`;
          const hours = workByAppointment.get(appId) || { projektering: 0, produktion: 0, montage: 0, total: 0 };
          const amounts = amountsByAppointment.get(appId) || { offer_amount: 0, materials_amount: 0 };
          const budget = budgetByAppointment.get(appId) || { projektering: 0, produktion: 0, montage: 0 };

          // Calculate remaining hours
          const remainingProjektering = Math.max(0, budget.projektering - hours.projektering);
          const remainingProduktion = Math.max(0, budget.produktion - hours.produktion);
          const remainingMontage = Math.max(0, budget.montage - hours.montage);

          const { error } = await supabase.rpc("upsert_project", {
            p_id: appointmentNumber,
            p_name: apt.subject || "",
            p_responsible_person_initials: initials,
            p_offer_amount: amounts.offer_amount,
            p_assembly_amount: 0,
            p_subcontractor_amount: 0,
            p_hours_used_projecting: hours.projektering,
            p_hours_used_production: hours.produktion,
            p_hours_used_assembly: hours.montage,
            p_materials_amount: amounts.materials_amount,
            p_hours_estimated_projecting: budget.projektering,
            p_hours_estimated_production: budget.produktion,
            p_hours_estimated_assembly: budget.montage,
            p_hours_used_total: hours.total,
            p_hours_remaining_projecting: remainingProjektering,
            p_hours_remaining_production: remainingProduktion,
            p_hours_remaining_assembly: remainingMontage,
            p_allocated_freight_amount: 0,
            p_last_api_update: now,
          });

          if (error) throw error;

          // Upsert individual item lines into offer_line_items
          const lines = itemLinesByAppointment.get(appId) || [];
          for (const line of lines) {
            const { error: lineError } = await supabase.rpc("upsert_offer_line_item", {
              p_hnlineid: line.hnLineID,
              p_project_id: appointmentNumber,
              p_description: line.description || "",
              p_units: line.units || 0,
              p_unitname: line.unitName || "",
              p_salespricestandardcurrency: line.salesPriceStandardCurrency || 0,
              p_totalpricestandardcurrency: line.totalPriceStandardCurrency || 0,
              p_hnbudgetlineid: line.hnBudgetLineID || 0,
            });
            if (lineError) {
              console.error(`Line item upsert error for ${appointmentNumber}:`, lineError);
            } else {
              lineItemsUpserted++;
            }
          }

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

    console.log(`Sync complete: ${upserted} upserted, ${lineItemsUpserted} line items, ${errors} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        appointments_fetched: appointments.length,
        projects_upserted: upserted,
        line_items_upserted: lineItemsUpserted,
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
