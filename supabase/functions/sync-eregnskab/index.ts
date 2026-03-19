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

// Fetch item lines in year-based chunks to stay under 50k limit
async function fetchItemLinesInChunks(apiKey: string): Promise<any[]> {
  const allLines: any[] = [];
  const currentYear = new Date().getFullYear();
  // Fetch last 5 years in parallel
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  
  const results = await Promise.allSettled(
    years.map(year => 
      eregnskabFetch(`/Appointment/Standard/Line/Item?from=${year}-01-01&to=${year}-12-31`, apiKey)
    )
  );
  
  for (const r of results) {
    if (r.status === "fulfilled" && r.value) {
      allLines.push(...r.value);
    }
  }
  return allLines;
}

// Fetch budget lines in year-based chunks to stay under 50k limit
async function fetchBudgetLinesInChunks(openAppointmentIds: Set<number>, apiKey: string): Promise<any[]> {
  // Budget lines don't support date filtering the same way
  // Try fetching per appointment in batches of 50 concurrent
  const allLines: any[] = [];
  const ids = Array.from(openAppointmentIds);
  const batchSize = 50;
  
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(id => eregnskabFetch(`/Appointment/Budget/Line?hnAppointmentID=${id}`, apiKey))
    );
    for (const r of results) {
      if (r.status === "fulfilled" && r.value) {
        allLines.push(...r.value);
      }
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

    // 1. Fetch bulk data in parallel
    console.log("Fetching core data from e-regnskab...");
    const [appointments, workLines, users] = await Promise.all([
      eregnskabFetch("/Appointment/Standard?open=true", EREGNSKAB_API_KEY),
      eregnskabFetch("/Appointment/Standard/Line/Work", EREGNSKAB_API_KEY),
      eregnskabFetch("/User", EREGNSKAB_API_KEY),
    ]);

    if (!appointments) throw new Error("Failed to fetch appointments");
    
    const openAppointmentIds = new Set<number>(appointments.map((a: any) => a.hnAppointmentID));
    console.log(`Fetched ${appointments.length} appointments, ${workLines?.length || 0} work lines`);

    // 2. Fetch item lines and budget lines (with chunking to avoid limits)
    console.log("Fetching item lines and budget lines...");
    const [itemLines, budgetLines] = await Promise.all([
      fetchItemLinesInChunks(EREGNSKAB_API_KEY),
      fetchBudgetLinesInChunks(openAppointmentIds, EREGNSKAB_API_KEY),
    ]);
    
    console.log(`Fetched ${itemLines.length} item lines, ${budgetLines.length} budget lines`);

    // Log sample data for debugging
    if (itemLines.length > 0) {
      console.log("Sample item line:", JSON.stringify(itemLines[0]));
    }
    if (budgetLines.length > 0) {
      console.log("Sample budget line:", JSON.stringify(budgetLines[0]));
    }

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

    // Group item lines by appointment ID → amounts (only for open appointments)
    const amountsByAppointment = new Map<number, { offer_amount: number }>();
    const itemLinesByAppointment = new Map<number, any[]>();
    for (const line of itemLines) {
      const appId = line.hnAppointmentID;
      if (!appId || !openAppointmentIds.has(appId)) continue;
      
      if (!amountsByAppointment.has(appId)) {
        amountsByAppointment.set(appId, { offer_amount: 0 });
      }
      const amounts = amountsByAppointment.get(appId)!;
      amounts.offer_amount += line.totalPriceStandardCurrency || 0;

      if (!itemLinesByAppointment.has(appId)) {
        itemLinesByAppointment.set(appId, []);
      }
      itemLinesByAppointment.get(appId)!.push(line);
    }

    // Group budget lines by appointment ID → estimated hours per category
    const budgetByAppointment = new Map<number, { projektering: number; produktion: number; montage: number }>();
    for (const line of budgetLines) {
      const appId = line.hnAppointmentID;
      if (!appId) continue;
      if (!budgetByAppointment.has(appId)) {
        budgetByAppointment.set(appId, { projektering: 0, produktion: 0, montage: 0 });
      }
      const budget = budgetByAppointment.get(appId)!;
      const units = line.units || 0;
      const category = workTypeCategoryMap[line.hnWorkTypeID];
      if (category) budget[category] += units;
    }

    console.log(`Grouped: ${amountsByAppointment.size} appointments with item lines, ${budgetByAppointment.size} with budget lines`);

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
          const amounts = amountsByAppointment.get(appId) || { offer_amount: 0 };
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
            p_materials_amount: 0,
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
