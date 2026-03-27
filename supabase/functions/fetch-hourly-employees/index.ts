import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const EREGNSKAB_BASE = "https://publicapi.e-regnskab.dk";

function logKeyInfo(label: string, raw: string | undefined) {
  if (!raw) { console.log(`${label}: NOT SET`); return; }
  const hasWhitespace = /\s/.test(raw);
  const hasQuotes = /["']/.test(raw);
  const prefix = raw.substring(0, 4);
  console.log(`${label}: length=${raw.length}, prefix="${prefix}...", hasWhitespace=${hasWhitespace}, hasQuotes=${hasQuotes}`);
}

async function eregnskabFetch(path: string, apiKey: string) {
  const res = await fetch(`${EREGNSKAB_BASE}${path}`, {
    headers: { accept: "application/json", ApiKey: apiKey },
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`e-regnskab ${path} failed [${res.status}]: ${body}`);
    return null;
  }
  return res.json();
}

async function fetchEmployeesFromAccount(apiKey: string, accountLabel: string) {
  const users = await eregnskabFetch("/User", apiKey);
  if (!users || !Array.isArray(users)) {
    console.error(`Failed to fetch Users from ${accountLabel}`);
    return [];
  }

  const activeUsers = users.filter((u: any) => u.isActive !== false);

  const employeeDetails = await Promise.all(
    activeUsers.map(async (u: any) => {
      const userId = u.hnUserID;
      const userInfo = await eregnskabFetch(`/User/Info/${userId}`, apiKey);
      const phone = userInfo?.cellphone || userInfo?.phone || "";

      return {
        hn_user_id: userId,
        name: u.name || `User ${userId}`,
        cellphone: phone,
      };
    })
  );

  console.log(`Fetched ${employeeDetails.length} employees from ${accountLabel}`);
  return employeeDetails;
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
    const rawKey1 = Deno.env.get("EREGNSKAB_API_KEY");
    const rawKey2 = Deno.env.get("EREGNSKAB_API_KEY_2");

    logKeyInfo("Konto 1 key", rawKey1);
    logKeyInfo("Konto 2 key", rawKey2);

    const apiKey1 = rawKey1?.trim();
    const apiKey2 = rawKey2?.trim();

    if (!apiKey1) throw new Error("EREGNSKAB_API_KEY is not configured");

    // Build list of accounts to fetch from
    const fetchTasks: Promise<any[]>[] = [
      fetchEmployeesFromAccount(apiKey1, "Konto 1"),
    ];
    if (apiKey2) {
      fetchTasks.push(fetchEmployeesFromAccount(apiKey2, "Konto 2"));
    }

    const results = await Promise.all(fetchTasks);
    const allEmployees = results.flat();

    // Sort combined list by name
    allEmployees.sort((a, b) => a.name.localeCompare(b.name, "da"));

    console.log(`Total employees from all accounts: ${allEmployees.length}`);

    return new Response(JSON.stringify(allEmployees), {
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
