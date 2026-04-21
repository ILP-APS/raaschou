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

  // Auth: valid JWT required
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  const sbAuth = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: { user }, error: authError } = await sbAuth.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  try {
    const apiKey = Deno.env.get("EREGNSKAB_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!apiKey || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing env vars");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const fetchEp = async (path: string) => {
      const res = await fetch(`https://publicapi.e-regnskab.dk${path}`, {
        headers: { accept: "application/json", ApiKey: apiKey },
      });
      if (!res.ok) throw new Error(`${path} returned ${res.status}`);
      return res.json();
    };

    const [categories, worktypes] = await Promise.all([
      fetchEp("/Appointment/Category"),
      fetchEp("/Appointment/WorkType"),
    ]);

    const catRows = (categories as any[]).map((c) => ({
      hn_appointment_category_id: c.hnAppointmentCategoryID,
      name: c.name,
      synced_at: new Date().toISOString(),
    }));
    const wtRows = (worktypes as any[]).map((w) => ({
      hn_work_type_id: w.hnWorkTypeID,
      name: w.name,
      api_internal: !!w.internal,
      hidden: !!w.hidden,
      synced_at: new Date().toISOString(),
    }));

    const { error: catErr } = await supabase
      .from("appointment_categories")
      .upsert(catRows, { onConflict: "hn_appointment_category_id" });
    if (catErr) throw catErr;

    const { error: wtErr } = await supabase
      .from("appointment_worktypes")
      .upsert(wtRows, { onConflict: "hn_work_type_id" });
    if (wtErr) throw wtErr;

    return new Response(
      JSON.stringify({
        success: true,
        categories: catRows.length,
        worktypes: wtRows.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
