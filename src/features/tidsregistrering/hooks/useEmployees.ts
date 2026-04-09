import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AutomationEmployee {
  hn_user_id: number;
  employee_name: string;
  phone_number: string;
  is_active: boolean;
  added_at: string;
  accounts: string[];
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

export function useSyncEmployees() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      // 1. Fetch all employees from e-regnskab
      const { data: apiEmployees, error: fetchError } = await supabase.functions.invoke("fetch-hourly-employees");
      if (fetchError) throw fetchError;
      if (!apiEmployees || !Array.isArray(apiEmployees)) throw new Error("Invalid response");

      // 2. Get existing hn_user_ids from DB
      const { data: existing, error: dbError } = await supabase
        .from("sms_automation_employees")
        .select("hn_user_id");
      if (dbError) throw dbError;
      const existingIds = new Set((existing || []).map((e: any) => e.hn_user_id));

      // 3. Split into new vs existing
      const newEmployees = apiEmployees.filter((e: any) => !existingIds.has(e.hn_user_id));
      const existingEmployees = apiEmployees.filter((e: any) => existingIds.has(e.hn_user_id));

      // 4. Insert new employees with is_active: false
      if (newEmployees.length > 0) {
        const { error: insertError } = await supabase
          .from("sms_automation_employees")
          .insert(
            newEmployees.map((e: any) => {
              const phone = e.cellphone
                ? (e.cellphone.startsWith("+45") ? e.cellphone : `+45${e.cellphone.replace(/\D/g, "")}`)
                : "";
              return {
                hn_user_id: e.hn_user_id,
                employee_name: e.name,
                phone_number: phone,
                is_active: false,
                accounts: e.accounts || [],
              };
            })
          );
        if (insertError) throw insertError;
      }

      // 5. Update existing employees (name + phone only, NOT is_active)
      for (const e of existingEmployees) {
        const phone = e.cellphone
          ? (e.cellphone.startsWith("+45") ? e.cellphone : `+45${e.cellphone.replace(/\D/g, "")}`)
          : "";
        const { error: updateError } = await supabase
          .from("sms_automation_employees")
          .update({ employee_name: e.name, phone_number: phone, accounts: e.accounts || [] })
          .eq("hn_user_id", e.hn_user_id);
        if (updateError) throw updateError;
      }

      return { added: newEmployees.length, updated: existingEmployees.length };
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
