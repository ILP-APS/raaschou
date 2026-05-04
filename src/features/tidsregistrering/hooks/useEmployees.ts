import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PhoneSource = "cellphone" | "phone" | "manual";

export interface AutomationEmployee {
  hn_user_id: number;
  employee_name: string;
  phone_number: string;
  eregnskab_cellphone: string | null;
  eregnskab_phone: string | null;
  manual_phone_number: string | null;
  phone_source: PhoneSource;
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

const fmt = (n: string | null | undefined) =>
  n ? (n.startsWith("+45") ? n : `+45${n.replace(/\D/g, "")}`) : "";

export function useSyncEmployees() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      // 1. Fetch all employees from e-regnskab
      const { data: apiEmployees, error: fetchError } = await supabase.functions.invoke("fetch-hourly-employees");
      if (fetchError) throw fetchError;
      if (!apiEmployees || !Array.isArray(apiEmployees)) throw new Error("Invalid response");

      // 2. Get existing rows from DB (need phone_source + manual_phone_number)
      const { data: existing, error: dbError } = await supabase
        .from("sms_automation_employees")
        .select("hn_user_id, phone_source, manual_phone_number");
      if (dbError) throw dbError;
      const existingMap = new Map<number, { phone_source: PhoneSource; manual_phone_number: string | null }>();
      for (const e of existing || []) {
        existingMap.set((e as any).hn_user_id, {
          phone_source: (e as any).phone_source,
          manual_phone_number: (e as any).manual_phone_number,
        });
      }

      const newEmployees = apiEmployees.filter((e: any) => !existingMap.has(e.hn_user_id));
      const existingEmployees = apiEmployees.filter((e: any) => existingMap.has(e.hn_user_id));

      // 4. Insert new employees with default phone_source = 'cellphone'
      if (newEmployees.length > 0) {
        const { error: insertError } = await supabase
          .from("sms_automation_employees")
          .insert(
            newEmployees.map((e: any) => {
              const cellphone = fmt(e.cellphone);
              const phone = fmt(e.phone);
              return {
                hn_user_id: e.hn_user_id,
                employee_name: e.name,
                eregnskab_cellphone: cellphone,
                eregnskab_phone: phone,
                phone_source: "cellphone",
                phone_number: cellphone,
                is_active: false,
                accounts: e.accounts || [],
              };
            })
          );
        if (insertError) throw insertError;
      }

      // 5. Update existing — opdater rå felter, udregn phone_number ud fra valgt kilde.
      //    Rør ALDRIG manual_phone_number ved sync.
      for (const e of existingEmployees) {
        const cellphone = fmt(e.cellphone);
        const phone = fmt(e.phone);
        const current = existingMap.get(e.hn_user_id)!;

        let effectivePhone: string;
        if (current.phone_source === "manual") {
          effectivePhone = current.manual_phone_number || "";
        } else if (current.phone_source === "phone") {
          effectivePhone = phone;
        } else {
          effectivePhone = cellphone;
        }

        const { error: updateError } = await supabase
          .from("sms_automation_employees")
          .update({
            employee_name: e.name,
            eregnskab_cellphone: cellphone,
            eregnskab_phone: phone,
            phone_number: effectivePhone,
            accounts: e.accounts || [],
          })
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

export function useUpdatePhoneSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      hn_user_id,
      phone_source,
      manual_phone_number,
    }: {
      hn_user_id: number;
      phone_source: PhoneSource;
      manual_phone_number?: string | null;
    }) => {
      const { data: current, error: fetchErr } = await supabase
        .from("sms_automation_employees")
        .select("eregnskab_cellphone, eregnskab_phone")
        .eq("hn_user_id", hn_user_id)
        .single();
      if (fetchErr) throw fetchErr;

      const formattedManual = phone_source === "manual" ? fmt(manual_phone_number) : null;

      let effectivePhone = "";
      if (phone_source === "manual") effectivePhone = formattedManual || "";
      else if (phone_source === "phone") effectivePhone = (current as any).eregnskab_phone || "";
      else effectivePhone = (current as any).eregnskab_cellphone || "";

      const { error } = await supabase
        .from("sms_automation_employees")
        .update({
          phone_source,
          manual_phone_number: formattedManual,
          phone_number: effectivePhone,
        })
        .eq("hn_user_id", hn_user_id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-automation-employees"] });
    },
  });
}
