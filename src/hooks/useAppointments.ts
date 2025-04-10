
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
        console.log("Fetching open appointments from API...");
        const fetchedAppointments = await fetchOpenAppointments();
        console.log(`Fetched ${fetchedAppointments.length} appointments from API`);
        
        // Log a sample of the first appointment's subject to verify it exists
        if (fetchedAppointments.length > 0) {
          console.log("Sample appointment subject:", fetchedAppointments[0].subject);
        }
        
        const sortedAppointments = sortAndGroupAppointments(fetchedAppointments);
        console.log(`After sorting and grouping: ${sortedAppointments.length} appointments`);
        
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
