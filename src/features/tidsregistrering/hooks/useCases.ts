import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ReminderCase {
  id: string;
  hn_user_id: number;
  missing_date: string;
  status: string;
  hours_expected: number;
  hours_registered_at_resolution: number | null;
  resolved_after_reminder: string | null;
  week_number: number;
  created_at: string;
  resolved_at: string | null;
}

interface CaseFilters {
  status?: string;
  weekNumber?: number;
  hnUserId?: number;
}

export function useCases(filters: CaseFilters = {}) {
  return useQuery({
    queryKey: ["sms-reminder-cases", filters],
    queryFn: async () => {
      let query = supabase
        .from("sms_reminder_cases")
        .select("*")
        .order("missing_date", { ascending: false })
        .limit(200);

      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.weekNumber) {
        query = query.eq("week_number", filters.weekNumber);
      }
      if (filters.hnUserId) {
        query = query.eq("hn_user_id", filters.hnUserId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ReminderCase[];
    },
  });
}
