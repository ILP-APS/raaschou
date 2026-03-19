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

function calculateHoursFromWorkLines(workLines: any[]) {
  const hours = { projektering: 0, produktion: 0, montage: 0, total: 0 };
  if (!workLines) return hours;
  for (const line of workLines) {
    const units = line.units || 0;
    const category = workTypeCategoryMap[line.hnWorkTypeID];
    if (category) hours[category] += units;
    hours.total += units;
  }
  return hours;
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

    // 1. Fetch all open standard appointments
    console.log("Fetching open appointments...");
    const appointments = await eregnskabFetch("/Appointment/Standard?open=true", EREGNSKAB_API_KEY);
    if (!appointments) throw new Error("Failed to fetch appointments");
    console.log(`Fetched ${appointments.length} open appointments`);

    // 2. Fetch users for initials mapping
    let userMap = new Map<number, string>();
    try {
      const users = await eregnskabFetch("/User", EREGNSKAB_API_KEY);
      if (users) {
        for (const u of users) {
          userMap.set(u.hnUserID, u.initials || u.name || `User ${u.hnUserID}`);
        }
      }
    } catch (e) {
      console.warn("Could not fetch users:", e);
    }

    const now = new Date().toISOString();
    let upserted = 0;
    let errors = 0;

    // 3. Process each appointment
    for (const apt of appointments) {
      try {
        const appId = apt.hnAppointmentID;
        const appointmentNumber = apt.appointmentNumber;
        const initials = userMap.get(apt.responsibleHnUserID) || `${apt.responsibleHnUserID}`;

        // Fetch work lines for this appointment (realized hours)
        const workLines = await eregnskabFetch(
          `/Appointment/Standard/Line/Work?hnAppointmentID=${appId}`,
          EREGNSKAB_API_KEY
        );
        const hours = calculateHoursFromWorkLines(workLines || []);

        // Fetch offer line items for this appointment
        const lineItems = await eregnskabFetch(
          `/Appointment/Standard/${appId}/Line/Item`,
          EREGNSKAB_API_KEY
        );

        // Calculate offer total and categorize items
        let offerTotal = 0;
        let assemblyAmount = 0;
        let subcontractorAmount = 0;
        if (lineItems) {
          for (const item of lineItems) {
            const total = item.totalPriceStandardCurrency || 0;
            offerTotal += total;
            const desc = (item.description || "").toLowerCase();
            if (desc.includes("montage") || desc.includes("montering")) {
              assemblyAmount += total;
            } else if (desc.includes("underleverand") || desc.includes("ekstern")) {
              subcontractorAmount += total;
            }
          }
        }

        // Fetch budget lines for estimated hours (if budget exists)
        let estHours = { projektering: 0, produktion: 0, montage: 0 };
        if (apt.hnBudgetID) {
          const budgetLines = await eregnskabFetch(
            `/Appointment/Budget/Line?hnBudgetID=${apt.hnBudgetID}`,
            EREGNSKAB_API_KEY
          );
          if (budgetLines) {
            for (const line of budgetLines) {
              const units = line.units || 0;
              const category = workTypeCategoryMap[line.hnWorkTypeID];
              if (category) estHours[category] += units;
            }
          }
        }

        // Upsert project
        const { error } = await supabase.rpc("upsert_project", {
          p_id: appointmentNumber,
          p_name: apt.subject || "",
          p_responsible_person_initials: initials,
          p_offer_amount: offerTotal,
          p_assembly_amount: assemblyAmount,
          p_subcontractor_amount: subcontractorAmount,
          p_hours_used_projecting: hours.projektering,
          p_hours_used_production: hours.produktion,
          p_hours_used_assembly: hours.montage,
          p_materials_amount: 0,
          p_hours_estimated_projecting: estHours.projektering,
          p_hours_estimated_production: estHours.produktion,
          p_hours_estimated_assembly: estHours.montage,
          p_hours_used_total: hours.total,
          p_hours_remaining_projecting: estHours.projektering - hours.projektering,
          p_hours_remaining_production: estHours.produktion - hours.produktion,
          p_hours_remaining_assembly: estHours.montage - hours.montage,
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
        if (lineItems) {
          for (const item of lineItems) {
            if (!item.hnLineID) continue;
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
        console.error(`Error processing appointment ${apt.appointmentNumber}:`, e);
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
