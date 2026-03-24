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
