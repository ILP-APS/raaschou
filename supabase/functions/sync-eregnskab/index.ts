import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const EREGNSKAB_BASE = "https://publicapi.e-regnskab.dk";

// Work type → category mapping (same as frontend workTypeMapping.ts)
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
    throw new Error(`e-regnskab ${path} failed [${res.status}]: ${text}`);
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

    console.log("Fetching open appointments from e-regnskab...");

    // 1. Fetch all open standard appointments
    const appointments = await eregnskabFetch("/Appointment/Standard?open=true", EREGNSKAB_API_KEY);
    console.log(`Fetched ${appointments.length} open appointments`);

    // 2. Fetch all work lines (realized hours) in one call
    const workLines = await eregnskabFetch("/Appointment/Standard/Line/Work", EREGNSKAB_API_KEY);
    console.log(`Fetched ${workLines.length} work lines`);

    // 3. Fetch all offer line items in one call
    const offerLineItems = await eregnskabFetch("/Appointment/Standard/Line/Item", EREGNSKAB_API_KEY);
    console.log(`Fetched ${offerLineItems.length} offer line items`);

    // 4. Fetch budget lines (estimated hours)
    const budgetLines = await eregnskabFetch("/Appointment/Budget/Line", EREGNSKAB_API_KEY);
    console.log(`Fetched ${budgetLines.length} budget lines`);

    // Group work lines by appointment ID
    const workByAppointment = new Map<number, { projektering: number; produktion: number; montage: number; total: number }>();
    for (const line of workLines) {
      const appId = line.hnAppointmentID;
      if (!appId) continue;
      if (!workByAppointment.has(appId)) {
        workByAppointment.set(appId, { projektering: 0, produktion: 0, montage: 0, total: 0 });
      }
      const hours = workByAppointment.get(appId)!;
      const units = line.units || 0;
      const category = workTypeCategoryMap[line.hnWorkTypeID] || null;
      if (category) hours[category] += units;
      hours.total += units;
    }

    // Group offer line items by appointment - calculate offer totals
    const offerByAppointment = new Map<string, { offerTotal: number; items: any[] }>();
    for (const item of offerLineItems) {
      // Items have hnAppointmentID or we link via appointmentNumber
      const appNumber = item.appointmentNumber || item.hnAppointmentID?.toString();
      if (!appNumber) continue;
      if (!offerByAppointment.has(appNumber)) {
        offerByAppointment.set(appNumber, { offerTotal: 0, items: [] });
      }
      const offer = offerByAppointment.get(appNumber)!;
      offer.offerTotal += item.totalPriceStandardCurrency || 0;
      offer.items.push(item);
    }

    // Group budget lines by budget ID for estimated hours
    const budgetByBudgetId = new Map<number, { projektering: number; produktion: number; montage: number }>();
    for (const line of budgetLines) {
      const budgetId = line.hnBudgetID;
      if (!budgetId) continue;
      if (!budgetByBudgetId.has(budgetId)) {
        budgetByBudgetId.set(budgetId, { projektering: 0, produktion: 0, montage: 0 });
      }
      // Budget lines may have work type categories too
      const est = budgetByBudgetId.get(budgetId)!;
      const units = line.units || 0;
      const category = workTypeCategoryMap[line.hnWorkTypeID] || null;
      if (category) est[category] += units;
    }

    // 5. Fetch users for initials mapping
    let userMap = new Map<number, string>();
    try {
      const users = await eregnskabFetch("/User", EREGNSKAB_API_KEY);
      for (const u of users) {
        userMap.set(u.hnUserID, u.initials || u.name || `User ${u.hnUserID}`);
      }
    } catch (e) {
      console.warn("Could not fetch users, using IDs instead:", e);
    }

    const now = new Date().toISOString();
    let upserted = 0;
    let errors = 0;

    // 6. Upsert each appointment into Supabase
    for (const apt of appointments) {
      try {
        const appId = apt.hnAppointmentID;
        const appointmentNumber = apt.appointmentNumber;
        const hours = workByAppointment.get(appId) || { projektering: 0, produktion: 0, montage: 0, total: 0 };
        const budget = apt.hnBudgetID ? budgetByBudgetId.get(apt.hnBudgetID) : null;
        const offer = offerByAppointment.get(appointmentNumber);
        const initials = userMap.get(apt.responsibleHnUserID) || `${apt.responsibleHnUserID}`;

        // Calculate remaining hours
        const estProjektering = budget?.projektering || 0;
        const estProduktion = budget?.produktion || 0;
        const estMontage = budget?.montage || 0;

        const { error } = await supabase.rpc("upsert_project", {
          p_id: appointmentNumber,
          p_name: apt.subject || "",
          p_responsible_person_initials: initials,
          p_offer_amount: offer?.offerTotal || 0,
          p_assembly_amount: 0, // Will be calculated from offer line items
          p_subcontractor_amount: 0,
          p_hours_used_projecting: hours.projektering,
          p_hours_used_production: hours.produktion,
          p_hours_used_assembly: hours.montage,
          p_materials_amount: 0,
          p_hours_estimated_projecting: estProjektering,
          p_hours_estimated_production: estProduktion,
          p_hours_estimated_assembly: estMontage,
          p_hours_used_total: hours.total,
          p_hours_remaining_projecting: estProjektering - hours.projektering,
          p_hours_remaining_production: estProduktion - hours.produktion,
          p_hours_remaining_assembly: estMontage - hours.montage,
          p_allocated_freight_amount: 0,
          p_last_api_update: now,
        });

        if (error) {
          console.error(`Error upserting project ${appointmentNumber}:`, error);
          errors++;
        } else {
          upserted++;
        }

        // Upsert offer line items
        if (offer?.items) {
          for (const item of offer.items) {
            await supabase.rpc("upsert_offer_line_item", {
              p_hnlineid: item.hnLineID,
              p_project_id: appointmentNumber,
              p_description: item.description || "",
              p_units: item.units || 0,
              p_unitname: item.unitName || "",
              p_salespricestandardcurrency: item.salesPriceStandardCurrency || 0,
              p_totalpricestandardcurrency: item.totalPriceStandardCurrency || 0,
              p_hnbudgetlineid: item.hnBudgetLineID || 0,
            });
          }
        }
      } catch (e) {
        console.error(`Error processing appointment:`, e);
        errors++;
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
