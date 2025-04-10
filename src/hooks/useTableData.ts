
import { useState, useEffect, useCallback } from "react";
import { useAppointments } from "./useAppointments";
import { useUsers } from "./useUsers";
import { useToast } from "@/hooks/use-toast";

export const useTableData = () => {
  const [tableData, setTableData] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { appointments, isLoading: isLoadingAppointments, error: appointmentsError } = useAppointments();
  const { users, isLoading: isLoadingUsers, error: usersError } = useUsers();
  const { toast } = useToast();
  
  const refetchData = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);
  
  useEffect(() => {
    const buildTableData = async () => {
      if (isLoadingAppointments || isLoadingUsers) {
        console.log("Still loading data, not building table data yet");
        return;
      }
      
      try {
        setIsLoading(true);
        console.log(`Processing ${appointments.length} appointments`);
        
        // Return empty table data - no mock data
        setTableData([]);
        
        if (appointments.length === 0) {
          toast({
            title: "No data available",
            description: "No appointments were found.",
            variant: "default",
          });
        }
      } catch (error) {
        console.error("Error building table data:", error);
        // Set empty table data instead of mock data
        setTableData([]);
        toast({
          title: "Error processing data",
          description: "Failed to process appointment data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    buildTableData();
  }, [appointments, users, isLoadingAppointments, isLoadingUsers, toast, refreshTrigger]);
  
  return { tableData, isLoading, error: appointmentsError || usersError, refetchData };
};
