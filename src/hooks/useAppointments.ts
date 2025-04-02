
import { useState, useEffect } from "react";
import { fetchOpenAppointments, sortAndGroupAppointments } from "@/utils/apiUtils";
import { Appointment } from "@/types/appointment";
import { useToast } from "@/hooks/use-toast";

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setIsLoading(true);
        const fetchedAppointments = await fetchOpenAppointments();
        const sortedAppointments = sortAndGroupAppointments(fetchedAppointments);
        setAppointments(sortedAppointments);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        toast({
          title: "Error loading appointments",
          description: "Failed to fetch appointments data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAppointments();
  }, [toast]);

  return { appointments, isLoading, error };
};
