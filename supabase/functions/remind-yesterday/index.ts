import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CLOUDTALK_SMS_URL = "https://my.cloudtalk.io/api/sms/send.json";
const SMS_SIGNATURE = "\n\nMed venlig hilsen\nRaaschou Administration\n\nNB: Denne besked kan ikke besvares";
const DAY_NAMES_DA = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];
const DEFAULT_HOURS: Record<string, number> = {
  monday: 7.5, tuesday: 7.5, wednesday: 7.5, thursday: 7.5, friday: 7.0, saturday: 0, sunday: 0,
};
const DAY_COLUMNS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function firstName(name: string): string {
  return (name || "").split(" ")[0] || "Kollega";
}

function formatPhone(raw: string): string {
  const digits = (raw || "").replace(/\D/g, "");
  return digits.startsWith("45") ? `+${digits}` : `+45${digits}`;
}

function mondayOfWeek(d: Date): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().split("T")[0];
}

function formatDateDa(dateStr: string): string {
  const d = new Date(dateStr);
  const dayName = DAY_NAMES_DA[d.getDay()];
  const day = d.getDate();
  const month = d.getMonth() + 1;
  return `${dayName} ${day}/${month}`;
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
    console.error("SMS error:", e);
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
    const CLOUDTALK_API_ID = Deno.env.get("CLOUDTALK_API_ID");
    const CLOUDTALK_API_KEY = Deno.env.get("CLOUDTALK_API_KEY");
    const CLOUDTALK_SENDER = Deno.env.get("CLOUDTALK_SENDER") || "+4552517633";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!CLOUDTALK_API_ID || !CLOUDTALK_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Determine "yesterday" in Copenhagen timezone
    const now = new Date();
    const cph = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Copenhagen" }));
    const yesterday = new Date(cph);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const hour = cph.getHours();
    const reminderType = hour < 10 ? "next_morning" : "next_midday";

    console.log(`remind-yesterday running for ${yesterdayStr}, type=${reminderType}`);

    // Get open cases from yesterday
    const { data: openCases, error: casesError } = await supabase
      .from("sms_reminder_cases")
      .select("*")
      .eq("status", "open")
      .eq("missing_date", yesterdayStr);

    if (casesError) throw new Error(`DB error: ${casesError.message}`);
    if (!openCases || openCases.length === 0) {
      console.log("No open cases from yesterday");
      return new Response(JSON.stringify({ success: true, cases: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get active employees for name/phone lookup
    const { data: activeEmployees } = await supabase
      .from("sms_automation_employees")
      .select("*")
      .eq("is_active", true);
    const empMap = new Map<number, any>();
    if (activeEmployees) {
      for (const e of activeEmployees) empMap.set(e.hn_user_id, e);
    }

    // Step 1: Trigger sync-registrations for affected users
    const affectedUserIds = [...new Set(openCases.map(c => c.hn_user_id))];
    const weekMonday = mondayOfWeek(new Date(yesterdayStr));
    const syncOk = await triggerSync(SUPABASE_URL, cronSecret, weekMonday, affectedUserIds);
    if (!syncOk) {
      console.error("sync-registrations failed, continuing with existing DB data");
    }

    // Step 2: Read updated hours from DB for yesterday
    const { data: yesterdayRegs } = await supabase
      .from("daily_time_registrations")
      .select("hn_user_id, duration")
      .eq("date", yesterdayStr)
      .in("hn_user_id", affectedUserIds);

    const hoursMap = new Map<number, number>();
    if (yesterdayRegs) {
      for (const r of yesterdayRegs) {
        hoursMap.set(r.hn_user_id, (hoursMap.get(r.hn_user_id) || 0) + Number(r.duration));
      }
    }

    // Get custom schedules for expected hours
    const { data: customSchedules } = await supabase.from("employee_work_schedules").select("*");
    const scheduleMap = new Map<number, any>();
    if (customSchedules) {
      for (const s of customSchedules) scheduleMap.set(s.hn_user_id, s);
    }

    let resolved = 0;
    let smsSent = 0;

    // Step 3: Evaluate each case against DB data
    for (const c of openCases) {
      const empData = empMap.get(c.hn_user_id);
      if (!empData) {
        console.log(`User ${c.hn_user_id} not in active employees, skipping`);
        continue;
      }

      const registeredHours = hoursMap.get(c.hn_user_id) || 0;

      // Determine expected hours for the case's date
      const caseDate = new Date(c.missing_date);
      const caseDayCol = DAY_COLUMNS[caseDate.getDay()];
      const caseSchedule = scheduleMap.get(c.hn_user_id);
      const expectedHours = caseSchedule ? (caseSchedule[caseDayCol] ?? DEFAULT_HOURS[caseDayCol]) : (DEFAULT_HOURS[caseDayCol] ?? 0);

      if (registeredHours >= expectedHours) {
        // Sufficient hours — resolve case
        await supabase.from("sms_reminder_cases").update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
          hours_registered_at_resolution: registeredHours,
          resolved_after_reminder: reminderType === "next_morning" ? "same_day" : "next_morning",
        }).eq("id", c.id);
        resolved++;
        console.log(`Case ${c.id} resolved (user ${c.hn_user_id}, ${registeredHours}h >= ${expectedHours}h)`);
        continue;
      }

      // Insufficient hours — send reminder
      const phone = empData.phone_number;
      if (!phone) { console.error(`No phone for user ${c.hn_user_id}`); continue; }

      // Duplicate protection
      const { data: existingLogs } = await supabase
        .from("sms_reminder_logs")
        .select("id")
        .eq("case_id", c.id)
        .eq("reminder_type", reminderType)
        .limit(1);
      if (existingLogs && existingLogs.length > 0) {
        console.log(`User ${c.hn_user_id} already received ${reminderType} SMS for case ${c.id}, skipping`);
        continue;
      }

      const name = firstName(empData.employee_name || "");
      const dateFormatted = formatDateDa(yesterdayStr);
      const formattedPhone = formatPhone(phone);
      const hasPartial = registeredHours > 0;

      let message: string;
      if (reminderType === "next_morning") {
        if (hasPartial) {
          message = `Godmorgen ${name}, du har registreret ${registeredHours.toFixed(1)} timer for ${dateFormatted}, men der forventes ${expectedHours.toFixed(1)}. Kan du opdatere i e-regnskab?${SMS_SIGNATURE}`;
        } else {
          message = `Godmorgen ${name}, du mangler stadig at registrere dine timer for ${dateFormatted} i e-regnskab. Kan du nå det her til morgen?${SMS_SIGNATURE}`;
        }
      } else {
        if (hasPartial) {
          message = `Hej ${name}, du har kun ${registeredHours.toFixed(1)} af ${expectedHours.toFixed(1)} timer registreret for ${dateFormatted}. Husk at opdatere i e-regnskab.${SMS_SIGNATURE}`;
        } else {
          message = `Hej ${name}, bare en påmindelse — der mangler stadig timeregistrering for ${dateFormatted} i e-regnskab.${SMS_SIGNATURE}`;
        }
      }

      const smsStatus = await sendSms(formattedPhone, message, CLOUDTALK_API_ID, CLOUDTALK_API_KEY, CLOUDTALK_SENDER);

      await supabase.from("sms_reminder_logs").insert({
        case_id: c.id,
        reminder_type: reminderType,
        sms_status: smsStatus,
        phone_number: formattedPhone,
      });

      smsSent++;
    }

    console.log(`remind-yesterday done: ${resolved} resolved, ${smsSent} SMS sent`);

    return new Response(
      JSON.stringify({ success: true, date: yesterdayStr, resolved, sms_sent: smsSent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("remind-yesterday error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
