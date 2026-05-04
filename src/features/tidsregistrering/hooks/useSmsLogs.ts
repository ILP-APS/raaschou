import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SmsLog {
  id: string;
  case_id: string;
  reminder_type: string;
  sent_at: string;
  sms_status: string | null;
  phone_number: string;
}

export interface SmsLogSummary {
  case_id: string;
  sms_count: number;
  last_sent_at: string | null;
}

// Bruges af SmsLogTable — viser de nyeste 200 SMS'er som historik.
export function useSmsLogs() {
  return useQuery({
    queryKey: ["sms-reminder-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sms_reminder_logs")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as SmsLog[];
    },
  });
}

// Bruges af CaseOverview — aggregeret count + last_sent_at pr. case, uanset alder.
export function useSmsLogSummary() {
  return useQuery({
    queryKey: ["sms-log-summary"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("sms_log_summary_per_case")
        .select("*");
      if (error) throw error;
      return data as SmsLogSummary[];
    },
  });
}
