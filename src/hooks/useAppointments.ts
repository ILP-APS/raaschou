
import { useState } from "react";
import { Appointment } from "@/types/appointment";

export const useAppointments = () => {
  const [appointments] = useState<Appointment[]>([]);
  const [isLoading] = useState(false);
  const [error] = useState<Error | null>(null);

  // No API fetching implementation - just return empty data
  return { appointments, isLoading, error };
};
