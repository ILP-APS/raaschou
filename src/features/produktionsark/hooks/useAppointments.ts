import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Appointment } from "../types/appointment";

export function useAppointments() {
  return useQuery({
    queryKey: ["produktionsark-appointments"],
    queryFn: async (): Promise<Appointment[]> => {
      const { data, error } = await supabase.functions.invoke("fetch-appointments");
      if (error) {
        console.error("Error fetching appointments:", error);
        throw new Error(error.message);
      }
      return data as Appointment[];
    },
  });
}
