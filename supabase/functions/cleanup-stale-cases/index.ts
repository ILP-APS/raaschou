import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

function mondayOfWeek(d: Date): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().split("T")[0];
}

async function triggerSync(supabaseUrl: string, cronSecret: string, weekStart: string, hnUserIds: number[]): Promise<boolean> {
  const res = await fetch(`${supabaseUrl}/functions/v1/sync-registrations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-cron-secret": cronSecret },
    body: JSON.stringify({ week_start: weekStart, hn_user_ids: hnUserIds }),
  });
  if (!res.ok) {
    console.error(`sync-registrations call failed [${res.status}] for week ${weekStart}`);
    return false;
  }
  const result = await res.json();
  return result.success === true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const cronSecret = Deno.env.get("CRON_SECRET");
  const providedSecret = req.headers.get("x-cron-secret");
  if (!cronSecret || providedSecret !== cronSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing env vars");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: openCases, error: casesError } = await supabase
      .from("sms_reminder_cases")
      .select("id, hn_user_id, missing_date, hours_expected")
      .eq("status", "open");
    if (casesError) throw new Error(`DB error: ${casesError.message}`);
    if (!openCases || openCases.length === 0) {
      return new Response(JSON.stringify({ success: true, resolved: 0, total_open: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`cleanup-stale-cases: ${openCases.length} åbne cases at re-evaluere`);

    const weekToUsers = new Map<string, Set<number>>();
    for (const c of openCases) {
      const week = mondayOfWeek(new Date(c.missing_date));
      if (!weekToUsers.has(week)) weekToUsers.set(week, new Set());
      weekToUsers.get(week)!.add(c.hn_user_id);
    }
    for (const [week, users] of weekToUsers) {
      const ok = await triggerSync(SUPABASE_URL, cronSecret, week, [...users]);
      if (!ok) console.error(`sync failed for week ${week}, fortsætter med eksisterende DB-data`);
    }

    const userIds = [...new Set(openCases.map(c => c.hn_user_id))];
    const dates = [...new Set(openCases.map(c => c.missing_date))];
    const { data: regs } = await supabase
      .from("daily_time_registrations")
      .select("hn_user_id, date, duration")
      .in("hn_user_id", userIds)
      .in("date", dates);

    const hoursMap = new Map<string, number>();
    if (regs) {
      for (const r of regs) {
        const key = `${r.hn_user_id}|${r.date}`;
        hoursMap.set(key, (hoursMap.get(key) || 0) + Number(r.duration));
      }
    }

    let resolved = 0;
    for (const c of openCases) {
      const key = `${c.hn_user_id}|${c.missing_date}`;
      const registered = hoursMap.get(key) || 0;

      if (registered >= Number(c.hours_expected)) {
        const { error: updErr } = await supabase
          .from("sms_reminder_cases")
          .update({
            status: "resolved",
            resolved_at: new Date().toISOString(),
            hours_registered_at_resolution: registered,
            resolved_after_reminder: "late_backfill",
          })
          .eq("id", c.id);
        if (updErr) {
          console.error(`Failed to resolve case ${c.id}: ${updErr.message}`);
          continue;
        }
        resolved++;
        console.log(`Resolved case ${c.id} (user ${c.hn_user_id}, ${c.missing_date}, ${registered}h >= ${c.hours_expected}h)`);
      }
    }

    console.log(`cleanup-stale-cases done: ${resolved} of ${openCases.length} resolved`);

    return new Response(
      JSON.stringify({ success: true, total_open: openCases.length, resolved }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("cleanup-stale-cases error:", error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
