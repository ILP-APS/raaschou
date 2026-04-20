import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Category IDs:
// 14: Projektering = 1916
// 15: Produktion på værksted til afhentning = 1896
// 16: Produktion på værksted til montage = 1897
// 18: Klar til montage = 1920
// 19: Montering = 1918
const CATEGORY_IDS = [1916, 1896, 1897, 1920, 1918];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth: require valid JWT
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
  }
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authError } = await sb.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('EREGNSKAB_API_KEY');
    if (!apiKey) throw new Error('EREGNSKAB_API_KEY not configured');

    console.log('Fetching open appointments from categories:', CATEGORY_IDS);

    const results = await Promise.all(
      CATEGORY_IDS.map(async (categoryId) => {
        const url = `https://publicapi.e-regnskab.dk/Appointment/Standard?open=true&hnAppointmentCategoryID=${categoryId}`;
        const response = await fetch(url, {
          headers: { 'accept': 'application/json', 'ApiKey': apiKey },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API error for category ${categoryId}:`, response.status, errorText);
          throw new Error(`API returned ${response.status} for category ${categoryId}`);
        }

        const data = await response.json();
        console.log(`Category ${categoryId}: ${Array.isArray(data) ? data.length : 0} appointments`);
        return data;
      })
    );

    const allAppointments = results.flat();
    console.log(`Total appointments in list: ${allAppointments.length}`);

    // Fetch detailed info for each appointment
    const detailedAppointments = await Promise.all(
      allAppointments.map(async (appointment: { hnAppointmentID: number }) => {
        const detailUrl = `https://publicapi.e-regnskab.dk/Appointment/Standard/${appointment.hnAppointmentID}`;
        const response = await fetch(detailUrl, {
          headers: { 'accept': 'application/json', 'ApiKey': apiKey },
        });

        if (!response.ok) {
          console.error(`Failed to fetch details for ${appointment.hnAppointmentID}:`, response.status);
          return null;
        }
        return response.json();
      })
    );

    const validAppointments = detailedAppointments.filter(apt => apt !== null);

    // Filter to ±2 years
    const now = new Date();
    const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
    const twoYearsAhead = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());

    const filteredAppointments = validAppointments.filter((apt: { startDate: string }) => {
      if (!apt.startDate) return false;
      const d = new Date(apt.startDate);
      return d >= twoYearsAgo && d <= twoYearsAhead;
    });

    console.log(`Filtered to ${filteredAppointments.length} appointments within date range`);

    return new Response(JSON.stringify(filteredAppointments), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in fetch-appointments:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
