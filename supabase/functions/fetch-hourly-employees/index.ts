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

    // 1. Get all hourly employees (Timelønnet, active)
    const workHours = await eregnskabFetch("/WorkTime/WorkHours", EREGNSKAB_API_KEY);
    if (!workHours || !Array.isArray(workHours)) {
      throw new Error("Failed to fetch WorkHours");
    }

    const hourlyEmployees = workHours.filter(
      (e: any) => e.name === "Timelønnet" && e.to === null
    );

    // 2. Get all users for names
    const users = await eregnskabFetch("/User", EREGNSKAB_API_KEY);
    const userMap = new Map<number, string>();
    if (users && Array.isArray(users)) {
      for (const u of users) {
        userMap.set(u.hnUserID, u.name || "");
      }
    }

    // 3. Fetch phone numbers for each hourly employee in parallel
    const employeeDetails = await Promise.all(
      hourlyEmployees.map(async (emp: any) => {
        const userId = emp.hnUserID;
        const userInfo = await eregnskabFetch(`/User/Info/${userId}`, EREGNSKAB_API_KEY);
        const cellphone = userInfo?.cellphone || "";
        const name = userMap.get(userId) || `User ${userId}`;

        return {
          hn_user_id: userId,
          name,
          cellphone,
        };
      })
    );

    // Sort by name
    employeeDetails.sort((a, b) => a.name.localeCompare(b.name, "da"));

    console.log(`Fetched ${employeeDetails.length} hourly employees with phone numbers`);

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
