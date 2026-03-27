import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth: require valid JWT
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.49.1");
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authError } = await sb.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }

  try {
    const EREGNSKAB_API_KEY = Deno.env.get("EREGNSKAB_API_KEY");
    if (!EREGNSKAB_API_KEY) throw new Error("EREGNSKAB_API_KEY is not configured");

    // 1. Get all active employees (not just hourly)
    const users = await eregnskabFetch("/User", EREGNSKAB_API_KEY);
    if (!users || !Array.isArray(users)) {
      throw new Error("Failed to fetch Users");
    }

    // Filter to active users only (no end date)
    const activeUsers = users.filter((u: any) => u.isActive !== false);

    // 2. Fetch phone numbers for each employee in parallel
    const employeeDetails = await Promise.all(
      activeUsers.map(async (u: any) => {
        const userId = u.hnUserID;
        const userInfo = await eregnskabFetch(`/User/Info/${userId}`, EREGNSKAB_API_KEY);
        const phone = userInfo?.cellphone || userInfo?.phone || "";

        return {
          hn_user_id: userId,
          name: u.name || `User ${userId}`,
          cellphone: phone,
        };
      })
    );

    // Sort by name
    employeeDetails.sort((a, b) => a.name.localeCompare(b.name, "da"));

    console.log(`Fetched ${employeeDetails.length} employees with phone numbers`);

    return new Response(JSON.stringify(employeeDetails), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("fetch-hourly-employees error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
