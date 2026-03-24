import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AutomationEmployee {
  hn_user_id: number;
  employee_name: string;
  phone_number: string;
  is_active: boolean;
  added_at: string;
}

export interface EmployeeSchedule {
  id: string;
  hn_user_id: number;
  employee_name: string;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
  is_custom: boolean;
}

export function useAutomationEmployees() {
  return useQuery({
    queryKey: ["sms-automation-employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sms_automation_employees")
        .select("*")
        .order("employee_name");
      if (error) throw error;
      return data as AutomationEmployee[];
    },
  });
}

export function useToggleEmployeeActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ hn_user_id, is_active }: { hn_user_id: number; is_active: boolean }) => {
      const { error } = await supabase
        .from("sms_automation_employees")
        .update({ is_active })
        .eq("hn_user_id", hn_user_id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-automation-employees"] });
    },
  });
}

export function useAddEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (employee: Omit<AutomationEmployee, "added_at">) => {
      const { error } = await supabase
        .from("sms_automation_employees")
        .upsert(employee, { onConflict: "hn_user_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-automation-employees"] });
    },
  });
}

export function useRemoveEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (hn_user_id: number) => {
      const { error } = await supabase
        .from("sms_automation_employees")
        .delete()
        .eq("hn_user_id", hn_user_id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-automation-employees"] });
    },
  });
}

export function useEmployeeSchedules() {
  return useQuery({
    queryKey: ["employee-work-schedules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_work_schedules")
        .select("*");
      if (error) throw error;
      return data as EmployeeSchedule[];
    },
  });
}

export function useUpsertSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (schedule: Omit<EmployeeSchedule, "id">) => {
      const { error } = await supabase
        .from("employee_work_schedules")
        .upsert(schedule, { onConflict: "hn_user_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-work-schedules"] });
    },
  });
}
