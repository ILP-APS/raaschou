import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EREGNSKAB_BASE = "https://publicapi.e-regnskab.dk";

async function eregnskabFetch(path: string, apiKey: string) {
  const res = await fetch(`${EREGNSKAB_BASE}${path}`, {
    headers: { accept: "application/json", ApiKey: apiKey },
  });
  if (!res.ok) {
    console.error(`e-regnskab ${path} failed [${res.status}]`);
    return null;
  }
  return res.json();
}

function mondayOfWeek(d: Date): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().split("T")[0];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

interface RegLine {
  hn_user_id: number;
  date: string;
  category: string;
  duration: number;
  hn_appointment_id: number | null;
  hn_appointment_category_id: number | null;
  hn_work_type_id: number | null;
  appointment_subject: string | null;
  appointment_project: string | null;
  description: string | null;
}

// Cache for appointment details to avoid duplicate API calls
const appointmentCache = new Map<number, {
  subject: string | null;
  project: string | null;
  hn_appointment_category_id: number | null;
}>();

async function fetchAppointmentDetails(
  hnAppointmentId: number, apiKey: string
): Promise<{ subject: string | null; project: string | null; hn_appointment_category_id: number | null }> {
  if (appointmentCache.has(hnAppointmentId)) {
    return appointmentCache.get(hnAppointmentId)!;
  }

  const data = await eregnskabFetch(`/Appointment/Standard/${hnAppointmentId}`, apiKey);
  const result = {
    subject: data?.subject || null,
    project: data?.project || null,
    hn_appointment_category_id: data?.hnAppointmentCategoryID ?? null,
  };
  appointmentCache.set(hnAppointmentId, result);
  return result;
}

async function fetchWeekRegistrations(
  hnUserId: number, rangeStart: string, rangeEnd: string, apiKeys: string[]
): Promise<RegLine[]> {
  // e-regnskab's `to` parameter is EXCLUSIVE on these endpoints, so we add one day
  // to make sure the last desired date (rangeEnd) is included in the response.
  const apiTo = addDays(rangeEnd, 1);
  const allLines: RegLine[] = [];
  for (const apiKey of apiKeys) {
    const [workLines, internalLines, sickness, vacation, privateDays] = await Promise.all([
      eregnskabFetch(`/Appointment/Standard/Line/Work?hnUserID=${hnUserId}&from=${rangeStart}&to=${apiTo}`, apiKey),
      eregnskabFetch(`/Appointment/Internal/Line/Work?hnUserID=${hnUserId}&from=${rangeStart}&to=${apiTo}`, apiKey),
      eregnskabFetch(`/WorkTime/Sickness?hnUserID=${hnUserId}&from=${rangeStart}&to=${apiTo}`, apiKey),
      eregnskabFetch(`/WorkTime/Vacation?hnUserID=${hnUserId}&from=${rangeStart}&to=${apiTo}`, apiKey),
      eregnskabFetch(`/WorkTime/Private?hnUserID=${hnUserId}&from=${rangeStart}&to=${apiTo}`, apiKey),
    ]);

    const lines: RegLine[] = [];

    const addWork = async (arr: any[] | null, category: string) => {
      if (!arr || !Array.isArray(arr)) return;
      for (const l of arr) {
        const dateStr = l.date?.split("T")[0];
        if (!dateStr) continue;
        if (dateStr < rangeStart || dateStr > rangeEnd) continue;

        let appointmentSubject = l.subject || null;
        let appointmentProject: string | null = null;
        let appointmentCategoryId: number | null = null;

        if (category === "work" && l.hnAppointmentID) {
          const details = await fetchAppointmentDetails(l.hnAppointmentID, apiKey);
          appointmentSubject = details.subject || appointmentSubject;
          appointmentProject = details.project;
          appointmentCategoryId = details.hn_appointment_category_id;
        }

        lines.push({
          hn_user_id: hnUserId,
          date: dateStr,
          category,
          duration: l.units || 0,
          hn_appointment_id: l.hnAppointmentID || null,
          hn_appointment_category_id: appointmentCategoryId,
          hn_work_type_id: l.hnWorkTypeID ?? null,
          appointment_subject: appointmentSubject,
          appointment_project: appointmentProject,
          description: l.description || null,
        });
      }
    };

    await addWork(workLines, "work");
    await addWork(internalLines, "internal");

    const addWorkTime = (arr: any[] | null, category: string) => {
      if (!arr || !Array.isArray(arr)) return;
      for (const item of arr) {
        const dateStr = item.start?.split("T")[0];
        if (!dateStr) continue;
        if (dateStr < rangeStart || dateStr > rangeEnd) continue;

        lines.push({
          hn_user_id: hnUserId,
          date: dateStr,
          category,
          duration: item.duration || 0,
          hn_appointment_id: null,
          hn_appointment_category_id: null,
          hn_work_type_id: null,
          appointment_subject: null,
          appointment_project: null,
          description: item.description || null,
        });
      }
    };

    addWorkTime(sickness, "sickness");
    addWorkTime(vacation, "vacation");
    addWorkTime(privateDays, "private");

    allLines.push(...lines);
  }
  return allLines;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth: accept EITHER valid JWT OR x-cron-secret header
  let authenticated = false;

  const cronSecret = Deno.env.get("CRON_SECRET");
  const providedCronSecret = req.headers.get("x-cron-secret");
  if (cronSecret && providedCronSecret === cronSecret) {
    authenticated = true;
  }

  if (!authenticated) {
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const sbAuth = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user }, error: authError } = await sbAuth.auth.getUser();
      if (!authError && user) {
        authenticated = true;
      }
    }
  }

  if (!authenticated) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }

  try {
    const EREGNSKAB_API_KEY = Deno.env.get("EREGNSKAB_API_KEY");
    const EREGNSKAB_API_KEY_2 = Deno.env.get("EREGNSKAB_API_KEY_2")?.trim();
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!EREGNSKAB_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let weekStart: string;
    let weekEnd: string;
    let filterUserIds: number[] | null = null;

    try {
      const body = await req.json();
      weekStart = body.week_start || mondayOfWeek(new Date());
      weekEnd = body.week_end || addDays(weekStart, 4);
      if (body.hn_user_ids && Array.isArray(body.hn_user_ids) && body.hn_user_ids.length > 0) {
        filterUserIds = body.hn_user_ids;
      }
    } catch {
      weekStart = mondayOfWeek(new Date());
      weekEnd = addDays(weekStart, 4);
    }
    console.log(`sync-registrations: syncing ${weekStart} to ${weekEnd}${filterUserIds ? ` for ${filterUserIds.length} specific users` : " for all active employees"}`);

    let employeeIds: number[];

    if (filterUserIds) {
      // Use provided user IDs directly (called from cron functions)
      employeeIds = filterUserIds;
    } else {
      // Fetch all active employees from both e-regnskab accounts
      const workHours1 = await eregnskabFetch("/WorkTime/WorkHours", EREGNSKAB_API_KEY);
      if (!workHours1 || !Array.isArray(workHours1)) {
        throw new Error("Failed to fetch WorkHours from e-regnskab");
      }
      const ids1 = workHours1
        .filter((e: any) => e.to === null && e.name !== "Fratrådt")
        .map((e: any) => e.hnUserID as number);

      let ids2: number[] = [];
      if (EREGNSKAB_API_KEY_2) {
        const workHours2 = await eregnskabFetch("/WorkTime/WorkHours", EREGNSKAB_API_KEY_2);
        if (workHours2 && Array.isArray(workHours2)) {
          ids2 = workHours2
            .filter((e: any) => e.to === null && e.name !== "Fratrådt")
            .map((e: any) => e.hnUserID as number);
        }
        console.log(`BYG account: ${ids2.length} active employees`);
      }
      employeeIds = [...new Set([...ids1, ...ids2])];
    }

    console.log(`Syncing ${employeeIds.length} employees`);

    // Clear appointment cache for each run
    appointmentCache.clear();

    let totalLines = 0;

    for (let i = 0; i < employeeIds.length; i += 5) {
      const batch = employeeIds.slice(i, i + 5);
      const apiKeys = [EREGNSKAB_API_KEY, ...(EREGNSKAB_API_KEY_2 ? [EREGNSKAB_API_KEY_2] : [])];
      const batchResults = await Promise.all(
        batch.map((userId) => fetchWeekRegistrations(userId, weekStart, weekEnd, apiKeys))
      );

      for (let j = 0; j < batch.length; j++) {
        const userId = batch[j];
        const lines = batchResults[j];

        if (lines.length === 0) continue;

        const workLines: RegLine[] = [];
        const workTimeLines: RegLine[] = [];
        for (const line of lines) {
          if (line.hn_appointment_id != null) {
            workLines.push(line);
          } else {
            workTimeLines.push(line);
          }
        }

        // Aggregate work lines with same key
        const keyMap = new Map<string, RegLine>();
        for (const line of workLines) {
          const key = `${line.hn_user_id}|${line.date}|${line.category}|${line.hn_appointment_id}`;
          const existing = keyMap.get(key);
          if (existing) {
            existing.duration += line.duration;
          } else {
            keyMap.set(key, { ...line });
          }
        }
        const dedupedWorkLines = Array.from(keyMap.values());

        if (dedupedWorkLines.length > 0) {
          const { error } = await supabase
            .from("daily_time_registrations")
            .upsert(dedupedWorkLines, { onConflict: "hn_user_id,date,category,hn_appointment_id" });
          if (error) console.error(`Upsert work error for user ${userId}:`, error.message);
          else totalLines += dedupedWorkLines.length;
        }

        if (workTimeLines.length > 0) {
          const categories = [...new Set(workTimeLines.map(l => l.category))];
          const { error: delError } = await supabase
            .from("daily_time_registrations")
            .delete()
            .eq("hn_user_id", userId)
            .gte("date", weekStart)
            .lte("date", weekEnd)
            .in("category", categories)
            .is("hn_appointment_id", null);
          if (delError) console.error(`Delete worktime error for user ${userId}:`, delError.message);

          const { error: insError } = await supabase
            .from("daily_time_registrations")
            .insert(workTimeLines);
          if (insError) console.error(`Insert worktime error for user ${userId}:`, insError.message);
          else totalLines += workTimeLines.length;
        }
      }
    }

    console.log(`sync-registrations done: ${totalLines} lines synced for ${employeeIds.length} employees`);

    return new Response(
      JSON.stringify({
        success: true,
        week_start: weekStart,
        week_end: weekEnd,
        employees: employeeIds.length,
        lines_synced: totalLines,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("sync-registrations error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
