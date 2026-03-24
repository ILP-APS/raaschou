import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EREGNSKAB_BASE = "https://publicapi.e-regnskab.dk";
const CLOUDTALK_SMS_URL = "https://my.cloudtalk.io/api/sms/send.json";
const SMS_SIGNATURE = "\n\nMed venlig hilsen\nRaaschou Administration\n\nNB: Denne besked kan ikke besvares";
const DAY_NAMES_DA = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];

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
  const dayName = DAY_NAMES_DA[d.getDay()];
  const day = d.getDate();
  const month = d.getMonth() + 1;
  return `${dayName} ${day}/${month}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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

    // Determine "yesterday" in Copenhagen timezone
    const now = new Date();
    const cph = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Copenhagen" }));
    const yesterday = new Date(cph);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Determine reminder type based on current hour
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

    let resolved = 0;
    let smsSent = 0;

    for (const c of openCases) {
      // Skip if employee is no longer active
      const empData = empMap.get(c.hn_user_id);
      if (!empData) {
        console.log(`User ${c.hn_user_id} not in active employees, skipping`);
        continue;
      }

      const reg = await checkRegistrations(c.hn_user_id, yesterdayStr, EREGNSKAB_API_KEY);

      if (reg.found) {
        // Resolve case
        await supabase.from("sms_reminder_cases").update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
          hours_registered_at_resolution: reg.totalHours,
          resolved_after_reminder: reminderType === "next_morning" ? "same_day" : "next_morning",
        }).eq("id", c.id);
        resolved++;
        console.log(`Case ${c.id} resolved (user ${c.hn_user_id})`);
        continue;
      }

      // Still not registered — send reminder
      const phone = empData.phone_number;
      if (!phone) { console.error(`No phone for user ${c.hn_user_id}`); continue; }

      const name = firstName(empData.employee_name || "");
      const dateFormatted = formatDateDa(yesterdayStr);
      const formattedPhone = formatPhone(phone);

      let message: string;
      if (reminderType === "next_morning") {
        message = `Godmorgen ${name}, du mangler stadig at registrere dine timer for ${dateFormatted} i e-regnskab. Kan du nå det her til morgen?${SMS_SIGNATURE}`;
      } else {
        message = `Hej ${name}, bare en påmindelse — der mangler stadig timeregistrering for ${dateFormatted} i e-regnskab.${SMS_SIGNATURE}`;
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
