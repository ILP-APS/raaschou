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

function sundayOfWeek(d: Date): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? 0 : 7 - day;
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
  description: string | null;
}

async function fetchRegistrationsForDate(
  hnUserId: number, dateStr: string, weekMon: string, weekSun: string, apiKey: string
): Promise<RegLine[]> {
  const [workLines, internalLines, sickness, vacation, privateDays] = await Promise.all([
    eregnskabFetch(`/Appointment/Standard/Line/Work?hnUserID=${hnUserId}&from=${dateStr}&to=${dateStr}`, apiKey),
    eregnskabFetch(`/Appointment/Internal/Line/Work?hnUserID=${hnUserId}&from=${dateStr}&to=${dateStr}`, apiKey),
    eregnskabFetch(`/WorkTime/Sickness?hnUserID=${hnUserId}&from=${weekMon}&to=${weekSun}`, apiKey),
    eregnskabFetch(`/WorkTime/Vacation?hnUserID=${hnUserId}&from=${weekMon}&to=${weekSun}`, apiKey),
    eregnskabFetch(`/WorkTime/Private?hnUserID=${hnUserId}&from=${weekMon}&to=${weekSun}`, apiKey),
  ]);

  const lines: RegLine[] = [];

  const addWork = (arr: any[] | null, category: string) => {
    if (!arr || !Array.isArray(arr)) return;
    for (const l of arr) {
      if (l.date?.startsWith(dateStr)) {
        lines.push({
          hn_user_id: hnUserId,
          date: dateStr,
          category,
          duration: l.units || 0,
          hn_appointment_id: l.hnAppointmentID || null,
          appointment_subject: l.appointmentSubject || l.subject || null,
          description: l.description || null,
        });
      }
    }
  };

  addWork(workLines, "work");
  addWork(internalLines, "internal");

  const filterRange = (arr: any[] | null, category: string) => {
    if (!arr || !Array.isArray(arr)) return;
    for (const item of arr) {
      const from = item.from?.split("T")[0];
      const to = item.to?.split("T")[0];
      if (from && to && from <= dateStr && to >= dateStr) {
        lines.push({
          hn_user_id: hnUserId,
          date: dateStr,
          category,
          duration: item.duration || item.hours || 0,
          hn_appointment_id: null,
          appointment_subject: null,
          description: null,
        });
      }
    }
  };

  filterRange(sickness, "sickness");
  filterRange(vacation, "vacation");
  filterRange(privateDays, "private");

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

    // Parse optional week_start param, default to current week
    let weekStart: string;
    try {
      const body = await req.json();
      weekStart = body.week_start || mondayOfWeek(new Date());
    } catch {
      weekStart = mondayOfWeek(new Date());
    }

    const weekEnd = addDays(weekStart, 6);
    console.log(`sync-registrations: syncing ${weekStart} to ${weekEnd}`);

    // Get all active hourly employees from e-regnskab
    const workHours = await eregnskabFetch("/WorkTime/WorkHours", EREGNSKAB_API_KEY);
    if (!workHours || !Array.isArray(workHours)) {
      throw new Error("Failed to fetch WorkHours from e-regnskab");
    }

    const hourlyEmployees = workHours
      .filter((e: any) => e.name === "Timelønnet" && e.to === null)
      .map((e: any) => e.hnUserID as number);

    console.log(`Found ${hourlyEmployees.length} active hourly employees`);

    // Generate weekdays (Mon-Fri)
    const weekdays: string[] = [];
    for (let i = 0; i < 5; i++) {
      weekdays.push(addDays(weekStart, i));
    }

    let totalLines = 0;

    // Process each employee
    for (const userId of hourlyEmployees) {
      const allLines: RegLine[] = [];

      // Fetch all 5 days in parallel for this employee
      const dayResults = await Promise.all(
        weekdays.map((dateStr) =>
          fetchRegistrationsForDate(userId, dateStr, weekStart, weekEnd, EREGNSKAB_API_KEY)
        )
      );

      for (const dayLines of dayResults) {
        allLines.push(...dayLines);
      }

      if (allLines.length === 0) continue;

      // Delete existing registrations for this user+week, then insert fresh
      await supabase
        .from("daily_time_registrations")
        .delete()
        .eq("hn_user_id", userId)
        .gte("date", weekStart)
        .lte("date", addDays(weekStart, 4));

      // Insert in batches
      const { error } = await supabase
        .from("daily_time_registrations")
        .insert(allLines);

      if (error) {
        console.error(`Insert error for user ${userId}:`, error.message);
      } else {
        totalLines += allLines.length;
      }
    }

    console.log(`sync-registrations done: ${totalLines} lines synced for ${hourlyEmployees.length} employees`);

    return new Response(
      JSON.stringify({
        success: true,
        week_start: weekStart,
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
