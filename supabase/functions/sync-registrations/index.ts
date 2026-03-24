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
  appointment_subject: string | null;
  appointment_project: string | null;
  description: string | null;
}

// Cache for appointment details to avoid duplicate API calls
const appointmentCache = new Map<number, { subject: string | null; project: string | null }>();

async function fetchAppointmentDetails(
  hnAppointmentId: number, apiKey: string
): Promise<{ subject: string | null; project: string | null }> {
  if (appointmentCache.has(hnAppointmentId)) {
    return appointmentCache.get(hnAppointmentId)!;
  }

  const data = await eregnskabFetch(`/Appointment/Standard/${hnAppointmentId}`, apiKey);
  const result = {
    subject: data?.subject || null,
    project: data?.project || null,
  };
  appointmentCache.set(hnAppointmentId, result);
  return result;
}

async function fetchWeekRegistrations(
  hnUserId: number, weekStart: string, weekEnd: string, apiKey: string
): Promise<RegLine[]> {
  // WorkTime endpoints need full week range (mon-sun) for reliable results
  const weekEndSunday = addDays(weekStart, 6);

  const [workLines, internalLines, sickness, vacation, privateDays] = await Promise.all([
    eregnskabFetch(`/Appointment/Standard/Line/Work?hnUserID=${hnUserId}&from=${weekStart}&to=${weekEnd}`, apiKey),
    eregnskabFetch(`/Appointment/Internal/Line/Work?hnUserID=${hnUserId}&from=${weekStart}&to=${weekEnd}`, apiKey),
    eregnskabFetch(`/WorkTime/Sickness?hnUserID=${hnUserId}&from=${weekStart}&to=${weekEndSunday}`, apiKey),
    eregnskabFetch(`/WorkTime/Vacation?hnUserID=${hnUserId}&from=${weekStart}&to=${weekEndSunday}`, apiKey),
    eregnskabFetch(`/WorkTime/Private?hnUserID=${hnUserId}&from=${weekStart}&to=${weekEndSunday}`, apiKey),
  ]);

  const lines: RegLine[] = [];

  // Process work lines — fetch appointment details per punkt 2.6
  const addWork = async (arr: any[] | null, category: string) => {
    if (!arr || !Array.isArray(arr)) return;
    for (const l of arr) {
      const dateStr = l.date?.split("T")[0];
      if (!dateStr) continue;

      let appointmentSubject = l.subject || null;
      let appointmentProject: string | null = null;

      // For standard work lines with hnAppointmentID, fetch appointment details
      if (category === "work" && l.hnAppointmentID) {
        const details = await fetchAppointmentDetails(l.hnAppointmentID, apiKey);
        appointmentSubject = details.subject || appointmentSubject;
        appointmentProject = details.project;
      }

      lines.push({
        hn_user_id: hnUserId,
        date: dateStr,
        category,
        duration: l.units || 0,
        hn_appointment_id: l.hnAppointmentID || null,
        appointment_subject: appointmentSubject,
        appointment_project: appointmentProject,
        description: l.description || null,
      });
    }
  };

  await addWork(workLines, "work");
  await addWork(internalLines, "internal");

  // WorkTime endpoints return: { hnWorkTimeID, hnUserID, start, duration, description, created }
  const addWorkTime = (arr: any[] | null, category: string) => {
    if (!arr || !Array.isArray(arr)) return;
    for (const item of arr) {
      const dateStr = item.start?.split("T")[0];
      if (!dateStr) continue;
      // Only include dates within the requested work week (mon-fri)
      if (dateStr < weekStart || dateStr > weekEnd) continue;

      lines.push({
        hn_user_id: hnUserId,
        date: dateStr,
        category,
        duration: item.duration || 0,
        hn_appointment_id: null,
        appointment_subject: null,
        appointment_project: null,
        description: item.description || null,
      });
    }
  };

  addWorkTime(sickness, "sickness");
  addWorkTime(vacation, "vacation");
  addWorkTime(privateDays, "private");

  return lines;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const EREGNSKAB_API_KEY = Deno.env.get("EREGNSKAB_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!EREGNSKAB_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let weekStart: string;
    try {
      const body = await req.json();
      weekStart = body.week_start || mondayOfWeek(new Date());
    } catch {
      weekStart = mondayOfWeek(new Date());
    }

    const weekEnd = addDays(weekStart, 4); // Friday
    console.log(`sync-registrations: syncing ${weekStart} to ${weekEnd}`);

    const workHours = await eregnskabFetch("/WorkTime/WorkHours", EREGNSKAB_API_KEY);
    if (!workHours || !Array.isArray(workHours)) {
      throw new Error("Failed to fetch WorkHours from e-regnskab");
    }

    const hourlyEmployees = workHours
      .filter((e: any) => e.name === "Timelønnet" && e.to === null)
      .map((e: any) => e.hnUserID as number);

    console.log(`Found ${hourlyEmployees.length} active hourly employees`);

    // Clear appointment cache for each run
    appointmentCache.clear();

    let totalLines = 0;

    for (let i = 0; i < hourlyEmployees.length; i += 5) {
      const batch = hourlyEmployees.slice(i, i + 5);
      const batchResults = await Promise.all(
        batch.map((userId) => fetchWeekRegistrations(userId, weekStart, weekEnd, EREGNSKAB_API_KEY))
      );

      for (let j = 0; j < batch.length; j++) {
        const userId = batch[j];
        const lines = batchResults[j];

        if (lines.length === 0) continue;

        // Aggregate lines with same key (hn_user_id, date, category, hn_appointment_id)
        // to avoid "cannot affect row a second time" errors
        const keyMap = new Map<string, RegLine>();
        for (const line of lines) {
          const key = `${line.hn_user_id}|${line.date}|${line.category}|${line.hn_appointment_id ?? "null"}`;
          const existing = keyMap.get(key);
          if (existing) {
            existing.duration += line.duration;
          } else {
            keyMap.set(key, { ...line });
          }
        }
        const dedupedLines = Array.from(keyMap.values());

        const { error } = await supabase
          .from("daily_time_registrations")
          .upsert(dedupedLines, { onConflict: "hn_user_id,date,category,hn_appointment_id" });

        if (error) {
          console.error(`Upsert error for user ${userId}:`, error.message);
        } else {
          totalLines += dedupedLines.length;
        }
      }
    }

    console.log(`sync-registrations done: ${totalLines} lines synced for ${hourlyEmployees.length} employees`);

    return new Response(
      JSON.stringify({
        success: true,
        week_start: weekStart,
        week_end: weekEnd,
        employees: hourlyEmployees.length,
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
