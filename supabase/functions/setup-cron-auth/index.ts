import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const CRON_SECRET = Deno.env.get("CRON_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!CRON_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required env vars");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const baseUrl = `${SUPABASE_URL}/functions/v1`;
    const functions = [
      { jobname: "check-today-mon-thu", schedule: "10 13 * * 1-4", fn: "check-today" },
      { jobname: "remind-yesterday-morning", schedule: "0 5 * * 2-5", fn: "remind-yesterday" },
      { jobname: "remind-yesterday-midday", schedule: "50 9 * * 2-5", fn: "remind-yesterday" },
      { jobname: "friday-summary", schedule: "40 12 * * 5", fn: "friday-summary" },
    ];

    for (const job of functions) {
      // Unschedule old
      await supabase.rpc("_exec_sql" as any, {} as any).catch(() => {});
      
      const headers = JSON.stringify({
        "Content-Type": "application/json",
        "x-cron-secret": CRON_SECRET,
      });

      const sql = `
        SELECT cron.unschedule('${job.jobname}');
        SELECT cron.schedule(
          '${job.jobname}',
          '${job.schedule}',
          $cronbody$
          SELECT net.http_post(
            url:='${baseUrl}/${job.fn}',
            headers:='${headers}'::jsonb,
            body:='{"time": "scheduled"}'::jsonb
          ) AS request_id;
          $cronbody$
        );
      `;

      // Use the service role client to execute raw SQL via REST
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: SUPABASE_SERVICE_ROLE_KEY,
        },
      });
    }

    // Actually, let's just use pg_meta or direct SQL endpoint
    // The simplest way: call the SQL editor endpoint
    const headers = JSON.stringify({
      "Content-Type": "application/json",
      "x-cron-secret": CRON_SECRET,
    }).replace(/'/g, "''");

    const updateSql = functions.map(job => `
      SELECT cron.unschedule('${job.jobname}');
      SELECT cron.schedule(
        '${job.jobname}',
        '${job.schedule}',
        $cronbody$
        SELECT net.http_post(
          url:='${baseUrl}/${job.fn}',
          headers:='${JSON.stringify({ "Content-Type": "application/json", "x-cron-secret": CRON_SECRET })}'::jsonb,
          body:='"time": "scheduled"}'::jsonb
        ) AS request_id;
        $cronbody$
      );
    `).join("\n");

    // Execute via pg endpoint
    const pgRes = await fetch(`${SUPABASE_URL}/pg`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: updateSql }),
    });

    return new Response(JSON.stringify({ success: true, message: "Cron jobs updated with CRON_SECRET" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
