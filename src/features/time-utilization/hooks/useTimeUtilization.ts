import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Registration {
  hn_user_id: number;
  date: string;
  category: string;
  duration: number;
  hn_appointment_id: number | null;
  hn_appointment_category_id: number | null;
  hn_work_type_id: number | null;
  appointment_subject: string | null;
}

export interface UtilizationEmployee {
  hn_user_id: number;
  employee_name: string;
}

export interface Settings {
  id: string;
  intern_appointment_category_ids: number[];
  intern_work_type_ids: number[];
  target_utilization: number;
}

export interface AppointmentCategory {
  hn_appointment_category_id: number;
  name: string;
}

export interface AppointmentWorktype {
  hn_work_type_id: number;
  name: string;
  api_internal: boolean;
  hidden: boolean;
}

export function useUtilizationEmployees() {
  return useQuery({
    queryKey: ["time-utilization-employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_utilization_employees")
        .select("hn_user_id, employee_name")
        .order("employee_name");
      if (error) throw error;
      return data as UtilizationEmployee[];
    },
  });
}

export function useUtilizationSettings() {
  return useQuery({
    queryKey: ["time-utilization-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_utilization_settings")
        .select("id, intern_appointment_category_ids, intern_work_type_ids, target_utilization")
        .limit(1)
        .single();
      if (error) throw error;
      return data as Settings;
    },
  });
}

export function useAppointmentCategories() {
  return useQuery({
    queryKey: ["appointment-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointment_categories")
        .select("hn_appointment_category_id, name")
        .order("name");
      if (error) throw error;
      return data as AppointmentCategory[];
    },
  });
}

export function useAppointmentWorktypes() {
  return useQuery({
    queryKey: ["appointment-worktypes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointment_worktypes")
        .select("hn_work_type_id, name, api_internal, hidden")
        .eq("hidden", false)
        .order("name");
      if (error) throw error;
      return data as AppointmentWorktype[];
    },
  });
}

export function useRegistrationsInRange(fromDate: string, toDate: string, hnUserIds: number[]) {
  return useQuery({
    queryKey: ["utilization-regs", fromDate, toDate, hnUserIds.slice().sort().join(",")],
    queryFn: async () => {
      if (hnUserIds.length === 0) return [];
      const { data, error } = await supabase
        .from("daily_time_registrations")
        .select("hn_user_id, date, category, duration, hn_appointment_id, hn_appointment_category_id, hn_work_type_id, appointment_subject")
        .gte("date", fromDate)
        .lte("date", toDate)
        .in("hn_user_id", hnUserIds);
      if (error) throw error;
      return data as Registration[];
    },
    enabled: hnUserIds.length > 0 && !!fromDate && !!toDate,
  });
}

export function useHourlyEmployeesInventar() {
  return useQuery({
    queryKey: ["hourly-employees-inventar"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("fetch-hourly-employees");
      if (error) throw error;
      const all = data as Array<{ hn_user_id: number; name: string; accounts: string[] }>;
      return all
        .filter((e) => e.accounts?.includes("Konto 1"))
        .map((e) => ({ hn_user_id: e.hn_user_id, name: e.name }));
    },
    staleTime: 1000 * 60 * 30,
  });
}
