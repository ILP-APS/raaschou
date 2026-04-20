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

  // Auth: require valid JWT
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authError } = await sb.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }

  try {
    const EREGNSKAB_API_KEY = Deno.env.get("EREGNSKAB_API_KEY");
    if (!EREGNSKAB_API_KEY) throw new Error("Missing EREGNSKAB_API_KEY");

    const { user_ids } = await req.json();
    if (!user_ids || !Array.isArray(user_ids)) {
      throw new Error("user_ids array required");
    }

    const results: Record<number, { hnUserID: number; name: string; username: string } | null> = {};

    await Promise.all(
      user_ids.map(async (id: number) => {
        try {
          const res = await fetch(`https://publicapi.e-regnskab.dk/User/${id}`, {
            headers: { accept: "application/json", ApiKey: EREGNSKAB_API_KEY },
          });
          if (!res.ok) {
            results[id] = null;
            return;
          }
          results[id] = await res.json();
        } catch {
          results[id] = null;
        }
      })
    );

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
