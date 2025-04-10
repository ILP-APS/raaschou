
import { useState, useEffect } from "react";
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
        // Empty appointments array - no mock data
        setAppointments([]);
      } catch (err) {
        console.error("Error loading appointments:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        toast({
          title: "Error loading appointments",
          description: "Failed to load appointment data.",
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
