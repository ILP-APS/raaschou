import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EREGNSKAB_BASE = "https://publicapi.e-regnskab.dk";
const CLOUDTALK_SMS_URL = "https://my.cloudtalk.io/api/sms/send.json";
const HOLIDAY_REF_USER = 14302;
const SMS_SIGNATURE = "\n\nMed venlig hilsen\nRaaschou Administration\n\nNB: Denne besked kan ikke besvares";
const DEFAULT_HOURS: Record<string, number> = {
  monday: 7.5, tuesday: 7.5, wednesday: 7.5, thursday: 7.5, friday: 7.0, saturday: 0, sunday: 0,
};
const DAY_COLUMNS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

// --- Helpers ---

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

function firstName(fullName: string): string {
  return (fullName || "").split(" ")[0] || "Kollega";
}

function formatPhone(raw: string): string {
  const digits = (raw || "").replace(/\D/g, "");
  return digits.startsWith("45") ? `+${digits}` : `+45${digits}`;
}

function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function mondayOfWeek(d: Date): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().split("T")[0];
}

async function isHoliday(dateStr: string, apiKey: string): Promise<boolean> {
  const data = await eregnskabFetch(`/WorkTime/Schedule/${HOLIDAY_REF_USER}?from=${dateStr}&to=${dateStr}`, apiKey);
  if (!data || !Array.isArray(data) || data.length === 0) return false;
  return data[0].duration === 0 || data[0].duration === 0.0;
}

async function triggerSync(supabaseUrl: string, cronSecret: string, weekStart: string, hnUserIds: number[]): Promise<boolean> {
  const res = await fetch(`${supabaseUrl}/functions/v1/sync-registrations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-cron-secret": cronSecret },
    body: JSON.stringify({ week_start: weekStart, hn_user_ids: hnUserIds }),
  });
  if (!res.ok) {
    console.error(`sync-registrations call failed [${res.status}]`);
    return false;
  }
  const result = await res.json();
  console.log(`sync-registrations result:`, JSON.stringify(result));
  return result.success === true;
}

async function sendSms(phone: string, message: string, apiId: string, apiKey: string, sender: string): Promise<string> {
  // SMS DISABLED - re-enable when logic is verified
  console.log(`[SMS DISABLED] Would send to ${phone}: ${message.substring(0, 80)}...`);
  return "disabled";
  const auth = btoa(`${apiId}:${apiKey}`);
  try {
    const res = await fetch(CLOUDTALK_SMS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
      body: JSON.stringify({ recipient: phone, message, sender }),
    });
    const data = await res.json();
    return data?.responseData?.[0]?.success ? "delivered" : "failed";
  } catch (e) {
    console.error("SMS send error:", e);
    return "error";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const cronSecret = Deno.env.get("CRON_SECRET");
  const providedSecret = req.headers.get("x-cron-secret");
  if (!cronSecret || providedSecret !== cronSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }

  try {
    const EREGNSKAB_API_KEY = Deno.env.get("EREGNSKAB_API_KEY");
    const CLOUDTALK_API_ID = Deno.env.get("CLOUDTALK_API_ID");
    const CLOUDTALK_API_KEY = Deno.env.get("CLOUDTALK_API_KEY");
    const CLOUDTALK_SENDER = Deno.env.get("CLOUDTALK_SENDER") || "+4552517633";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!EREGNSKAB_API_KEY || !CLOUDTALK_API_ID || !CLOUDTALK_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const now = new Date();
    const cph = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Copenhagen" }));
    const todayStr = cph.toISOString().split("T")[0];
    const dayOfWeek = cph.getDay();

    console.log(`check-today running for ${todayStr} (day ${dayOfWeek})`);

    // Only run Mon-Thu (1-4); Friday is handled by friday-summary
    if (dayOfWeek < 1 || dayOfWeek > 4) {
      return new Response(JSON.stringify({ skipped: true, reason: "Not Mon-Thu" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Holiday check (only API call kept — uses e-regnskab schedule endpoint)
    if (await isHoliday(todayStr, EREGNSKAB_API_KEY)) {
      console.log("Holiday detected, skipping");
      return new Response(JSON.stringify({ skipped: true, reason: "Holiday" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get active employees from DB
    const { data: activeEmployees, error: empError } = await supabase
      .from("sms_automation_employees")
      .select("*")
      .eq("is_active", true);

    if (empError) throw new Error(`DB error: ${empError.message}`);
    if (!activeEmployees || activeEmployees.length === 0) {
      console.log("No active employees in sms_automation_employees");
      return new Response(JSON.stringify({ success: true, message: "No active employees" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${activeEmployees.length} active automation employees`);

    // Step 1: Trigger sync-registrations for all active employees
    const weekMonday = mondayOfWeek(cph);
    const hnUserIds = activeEmployees.map(e => e.hn_user_id);
    const syncOk = await triggerSync(SUPABASE_URL, cronSecret, weekMonday, hnUserIds);
    if (!syncOk) {
      console.error("sync-registrations failed, continuing with existing DB data");
    }

    // Step 2: Read from DB — get today's registrations
    const { data: todayRegs } = await supabase
      .from("daily_time_registrations")
      .select("hn_user_id, duration")
      .eq("date", todayStr)
      .in("hn_user_id", hnUserIds);

    // Aggregate hours per user from DB
    const hoursMap = new Map<number, number>();
    if (todayRegs) {
      for (const r of todayRegs) {
        hoursMap.set(r.hn_user_id, (hoursMap.get(r.hn_user_id) || 0) + Number(r.duration));
      }
    }

    // Get custom schedules
    const { data: customSchedules } = await supabase.from("employee_work_schedules").select("*");
    const scheduleMap = new Map<number, any>();
    if (customSchedules) {
      for (const s of customSchedules) scheduleMap.set(s.hn_user_id, s);
    }

    const weekNum = getWeekNumber(cph);
    const dayCol = DAY_COLUMNS[dayOfWeek];
    let smsSent = 0;
    let casesCreated = 0;

    // Step 3: Compare DB data with expected hours
    for (const emp of activeEmployees) {
      const userId = emp.hn_user_id;
      const schedule = scheduleMap.get(userId);
      const expectedHours = schedule ? (schedule[dayCol] ?? DEFAULT_HOURS[dayCol]) : (DEFAULT_HOURS[dayCol] ?? 0);

      if (expectedHours <= 0) {
        console.log(`User ${userId} not expected to work today, skipping`);
        continue;
      }

      const registeredHours = hoursMap.get(userId) || 0;
      console.log(`User ${userId}: registered=${registeredHours}h, expected=${expectedHours}h`);

      if (registeredHours >= expectedHours) {
        console.log(`User ${userId} has sufficient registrations, OK`);
        continue;
      }

      // Insufficient hours — create case
      const { data: existingCase } = await supabase
        .from("sms_reminder_cases")
        .select("id")
        .eq("hn_user_id", userId)
        .eq("missing_date", todayStr)
        .maybeSingle();

      let caseId = existingCase?.id;
      if (!caseId) {
        const { data: newCase } = await supabase
          .from("sms_reminder_cases")
          .insert({
            hn_user_id: userId,
            missing_date: todayStr,
            status: "open",
            hours_expected: expectedHours,
            week_number: weekNum,
          })
          .select("id")
          .single();
        caseId = newCase?.id;
        casesCreated++;
      }

      const phone = emp.phone_number;
      if (!phone) { console.error(`No phone for user ${userId}`); continue; }

      // Duplicate protection
      if (caseId) {
        const { data: existingLogs } = await supabase
          .from("sms_reminder_logs")
          .select("id")
          .eq("case_id", caseId)
          .eq("reminder_type", "same_day")
          .limit(1);
        if (existingLogs && existingLogs.length > 0) {
          console.log(`User ${userId} already received same_day SMS for today, skipping`);
          continue;
        }
      }

      const name = firstName(emp.employee_name || "");
      const isMissing = registeredHours === 0;
      let message: string;
      if (isMissing) {
        message = `Hej ${name}, du mangler at registrere dine timer for i dag i e-regnskab. Husk det inden du går hjem.${SMS_SIGNATURE}`;
      } else {
        message = `Hej ${name}, du har kun registreret ${registeredHours.toFixed(1)} timer i dag, men der forventes ${expectedHours.toFixed(1)} timer. Husk at opdatere i e-regnskab inden du går hjem.${SMS_SIGNATURE}`;
      }
      const formattedPhone = formatPhone(phone);

      const smsStatus = await sendSms(formattedPhone, message, CLOUDTALK_API_ID, CLOUDTALK_API_KEY, CLOUDTALK_SENDER);

      await supabase.from("sms_reminder_logs").insert({
        case_id: caseId,
        reminder_type: "same_day",
        sms_status: smsStatus,
        phone_number: formattedPhone,
      });

      smsSent++;
      console.log(`SMS sent to user ${userId} (${smsStatus})`);
    }

    console.log(`check-today done: ${casesCreated} cases, ${smsSent} SMS sent`);

    return new Response(
      JSON.stringify({ success: true, date: todayStr, cases_created: casesCreated, sms_sent: smsSent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("check-today error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
