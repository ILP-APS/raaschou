import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDateStr, type WeekRange } from "../utils/weekUtils";

export interface DayRegistration {
  hn_user_id: number;
  date: string;
  category: string;
  duration: number;
  hn_appointment_id: number | null;
  appointment_subject: string | null;
  description: string | null;
}

export interface EmployeeInfo {
  hn_user_id: number;
  employee_name: string;
}

export function useWeekData(weekRange: WeekRange) {
  const startStr = formatDateStr(weekRange.start);
  const endStr = formatDateStr(weekRange.end);

  // Fetch active hourly employees from e-regnskab via edge function
  const employeesQuery = useQuery({
    queryKey: ["loentjek-hourly-employees"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("fetch-hourly-employees");
      if (error) throw error;
      const employees = data as Array<{ hn_user_id: number; name: string; cellphone: string }>;
      return employees.map((e) => ({
        hn_user_id: e.hn_user_id,
        employee_name: e.name,
      })) as EmployeeInfo[];
    },
    staleTime: 1000 * 60 * 30, // Cache 30 min — changes rarely
  });

  const registrationsQuery = useQuery({
    queryKey: ["loentjek-registrations", startStr, endStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_time_registrations")
        .select("hn_user_id, date, category, duration, hn_appointment_id, appointment_subject, description")
        .gte("date", startStr)
        .lte("date", endStr);
      if (error) throw error;
      return data as DayRegistration[];
    },
  });

  const schedulesQuery = useQuery({
    queryKey: ["loentjek-schedules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_work_schedules")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  return {
    employees: employeesQuery.data ?? [],
    registrations: registrationsQuery.data ?? [],
    schedules: schedulesQuery.data ?? [],
    isLoading: employeesQuery.isLoading || registrationsQuery.isLoading || schedulesQuery.isLoading,
  };
}
