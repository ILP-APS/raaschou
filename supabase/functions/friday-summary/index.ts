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
const DAY_NAMES_DA = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];
const DEFAULT_HOURS: Record<string, number> = {
  monday: 7.5, tuesday: 7.5, wednesday: 7.5, thursday: 7.5, friday: 7.0, saturday: 0, sunday: 0,
};
const DAY_COLUMNS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

async function eregnskabFetch(path: string, apiKey: string) {
  const res = await fetch(`${EREGNSKAB_BASE}${path}`, {
    headers: { accept: "application/json", ApiKey: apiKey },
  });
  if (!res.ok) return null;
  return res.json();
}

function firstName(name: string): string {
  return (name || "").split(" ")[0] || "Kollega";
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

function sundayOfWeek(d: Date): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().split("T")[0];
}

async function isHoliday(dateStr: string, apiKey: string): Promise<boolean> {
  const data = await eregnskabFetch(`/WorkTime/Schedule/${HOLIDAY_REF_USER}?from=${dateStr}&to=${dateStr}`, apiKey);
  if (!data || !Array.isArray(data) || data.length === 0) return false;
  return data[0].duration === 0 || data[0].duration === 0.0;
}

async function getHourlyEmployees(apiKey: string): Promise<any[]> {
  const data = await eregnskabFetch("/WorkTime/WorkHours", apiKey);
  if (!data || !Array.isArray(data)) return [];
  return data.filter((e: any) => e.name === "Timelønnet" && e.to === null);
}

async function checkRegistrations(hnUserId: number, dateStr: string, apiKey: string): Promise<{ found: boolean; totalHours: number }> {
  const weekMon = mondayOfWeek(new Date(dateStr));
  const weekSun = sundayOfWeek(new Date(dateStr));

  const [workLines, internalLines, sickness, vacation, privateDays] = await Promise.all([
    eregnskabFetch(`/Appointment/Standard/Line/Work?hnUserID=${hnUserId}&from=${dateStr}&to=${dateStr}`, apiKey),
    eregnskabFetch(`/Appointment/Internal/Line/Work?hnUserID=${hnUserId}&from=${dateStr}&to=${dateStr}`, apiKey),
    eregnskabFetch(`/WorkTime/Sickness?hnUserID=${hnUserId}&from=${weekMon}&to=${weekSun}`, apiKey),
    eregnskabFetch(`/WorkTime/Vacation?hnUserID=${hnUserId}&from=${weekMon}&to=${weekSun}`, apiKey),
    eregnskabFetch(`/WorkTime/Private?hnUserID=${hnUserId}&from=${weekMon}&to=${weekSun}`, apiKey),
  ]);

  let totalHours = 0;
  let found = false;

  const addWork = (arr: any[] | null) => {
    if (!arr || !Array.isArray(arr)) return;
    for (const l of arr) {
      if (l.date?.startsWith(dateStr)) { found = true; totalHours += l.units || 0; }
    }
  };
  addWork(workLines);
  addWork(internalLines);

  const filterRange = (arr: any[] | null) => {
    if (!arr || !Array.isArray(arr)) return;
    for (const item of arr) {
      const from = item.from?.split("T")[0];
      const to = item.to?.split("T")[0];
      if (from && to && from <= dateStr && to >= dateStr) {
        found = true;
        totalHours += item.duration || item.hours || 0;
      }
    }
  };
  filterRange(sickness);
  filterRange(vacation);
  filterRange(privateDays);

  return { found, totalHours };
}

async function sendSms(phone: string, message: string, apiId: string, apiKey: string, sender: string): Promise<string> {
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

function formatDateDa(dateStr: string): string {
  const d = new Date(dateStr);
  return `${DAY_NAMES_DA[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth: require CRON_SECRET (cron-invoked)
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

    console.log(`friday-summary running for ${todayStr}`);

    if (dayOfWeek !== 5) {
      return new Response(JSON.stringify({ skipped: true, reason: "Not Friday" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (await isHoliday(todayStr, EREGNSKAB_API_KEY)) {
      console.log("Holiday on Friday, skipping");
      return new Response(JSON.stringify({ skipped: true, reason: "Holiday" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get active employees from sms_automation_employees table
    const { data: activeEmployees, error: empError } = await supabase
      .from("sms_automation_employees")
      .select("*")
      .eq("is_active", true);

    if (empError) throw new Error(`DB error: ${empError.message}`);
    if (!activeEmployees || activeEmployees.length === 0) {
      console.log("No active employees");
      return new Response(JSON.stringify({ success: true, message: "No active employees" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: customSchedules } = await supabase.from("employee_work_schedules").select("*");
    const scheduleMap = new Map<number, any>();
    if (customSchedules) {
      for (const s of customSchedules) scheduleMap.set(s.hn_user_id, s);
    }

    const weekNum = getWeekNumber(cph);
    const weekMonday = mondayOfWeek(cph);
    let smsSent = 0;

    for (const emp of activeEmployees) {
      const userId = emp.hn_user_id;
      const schedule = scheduleMap.get(userId);
      const fridayHours = schedule ? (schedule.friday ?? DEFAULT_HOURS.friday) : DEFAULT_HOURS.friday;

      // Check Friday registration
      let fridayMissing = false;
      if (fridayHours > 0) {
        const fridayReg = await checkRegistrations(userId, todayStr, EREGNSKAB_API_KEY);
        if (fridayReg.totalHours < fridayHours) {
          fridayMissing = true;
          // Create case for Friday
          await supabase.from("sms_reminder_cases").upsert({
            hn_user_id: userId,
            missing_date: todayStr,
            status: "open",
            hours_expected: fridayHours,
            week_number: weekNum,
          }, { onConflict: "hn_user_id,missing_date" });
        }
      }

      // Get all open cases this week for this user
      const { data: weekCases } = await supabase
        .from("sms_reminder_cases")
        .select("*")
        .eq("hn_user_id", userId)
        .eq("status", "open")
        .gte("missing_date", weekMonday)
        .lte("missing_date", todayStr);

      if (!weekCases || weekCases.length === 0) continue;

      // Re-check each case (maybe they registered since last check)
      const stillOpen: typeof weekCases = [];
      for (const c of weekCases) {
        const reg = await checkRegistrations(userId, c.missing_date, EREGNSKAB_API_KEY);
        // Determine expected hours for this case's day
        const caseDate = new Date(c.missing_date);
        const caseDayCol = DAY_COLUMNS[caseDate.getDay()];
        const caseExpected = schedule ? (schedule[caseDayCol] ?? DEFAULT_HOURS[caseDayCol]) : (DEFAULT_HOURS[caseDayCol] ?? 0);

        if (reg.totalHours >= caseExpected) {
          await supabase.from("sms_reminder_cases").update({
            status: "resolved",
            resolved_at: new Date().toISOString(),
            hours_registered_at_resolution: reg.totalHours,
            resolved_after_reminder: "friday_summary",
          }).eq("id", c.id);
        } else {
          stillOpen.push(c);
        }
      }

      if (stillOpen.length === 0) continue;

      // Use phone and name from sms_automation_employees table
      const phone = emp.phone_number;
      if (!phone) { console.error(`No phone for user ${userId}`); continue; }

      const name = firstName(emp.employee_name || "");
      const formattedPhone = formatPhone(phone);

      let message: string;
      const onlyFriday = stillOpen.length === 1 && stillOpen[0].missing_date === todayStr;

      if (onlyFriday) {
        message = `Hej ${name}, husk at registrere dine timer for i dag inden du går på weekend.${SMS_SIGNATURE}`;
      } else {
        const hasFriday = stillOpen.some(c => c.missing_date === todayStr);
        const otherDays = stillOpen
          .filter(c => c.missing_date !== todayStr)
          .map(c => formatDateDa(c.missing_date));

        if (hasFriday && otherDays.length > 0) {
          message = `Hej ${name}, du mangler at registrere timer for i dag (fredag). Derudover mangler du stadig registrering for ${otherDays.join(" og ")}.${SMS_SIGNATURE}`;
        } else {
          // Only previous days, no Friday
          message = `Hej ${name}, du mangler stadig at registrere timer for ${otherDays.join(" og ")}. Husk det inden weekenden.${SMS_SIGNATURE}`;
        }
      }

      const smsStatus = await sendSms(formattedPhone, message, CLOUDTALK_API_ID, CLOUDTALK_API_KEY, CLOUDTALK_SENDER);

      // Log for each case
      for (const c of stillOpen) {
        await supabase.from("sms_reminder_logs").insert({
          case_id: c.id,
          reminder_type: "friday_summary",
          sms_status: smsStatus,
          phone_number: formattedPhone,
        });
      }

      smsSent++;
    }

    console.log(`friday-summary done: ${smsSent} SMS sent`);

    return new Response(
      JSON.stringify({ success: true, date: todayStr, sms_sent: smsSent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("friday-summary error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
