
import { useState, useEffect, useCallback } from "react";
import { useAppointments } from "./useAppointments";
import { useUsers } from "./useUsers";
import { generateTableData } from "@/utils/tableData";
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
      
      if (!appointments || appointments.length === 0) {
        console.log("No appointments available, using sample data");
        const sampleData = generateTableData();
        setTableData(sampleData);
        toast({
          title: "Using sample data",
          description: "No appointments were found. Using sample data instead.",
          variant: "default",
        });
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        console.log(`Processing ${appointments.length} appointments`);
        
        if (appointments.length > 0) {
          console.log("First appointment details:", {
            number: appointments[0].appointmentNumber,
            subject: appointments[0].subject,
            id: appointments[0].hnAppointmentID
          });
        }
        
        // Create simple table data from appointments
        const processedData = appointments.map(appointment => {
          // Get a random user name for responsible person
          const randomUsers = ['John', 'Anna', 'Peter', 'Maria', 'Thomas', 'Sofie', 'Lars', 'Mette'];
          const responsibleUserName = randomUsers[Math.floor(Math.random() * randomUsers.length)];
          
          // Generate random values for numeric fields
          const offerTotal = (Math.random() * 500000 + 50000).toFixed(2);
          const montageTotal = (Math.random() * 100000 + 10000).toFixed(2);
          const underleverandorTotal = (Math.random() * 80000 + 5000).toFixed(2);
          
          // Build the row of data
          const row = [
            appointment.appointmentNumber,
            appointment.subject,
            responsibleUserName,
            offerTotal,
            montageTotal,
            underleverandorTotal,
          ];
          
          // Add more placeholder data for the remaining columns
          for (let i = 6; i < 23; i++) {
            if (i >= 8 && i <= 15) {
              // For numeric values
              row.push((Math.random() * 10000).toFixed(2));
            } else if (i >= 18 && i <= 19) {
              // For percentage values
              row.push(`${Math.floor(Math.random() * 100)}%`);
            } else {
              row.push(`Value ${i}`);
            }
          }
          
          // Add row type flag (every third row is a sub-appointment)
          const rowIndex = parseInt(appointment.appointmentNumber) % 3;
          row.push(rowIndex === 0 ? 'sub-appointment' : 'parent-appointment');
          
          return row;
        });
        
        console.log(`Created ${processedData.length} rows of table data`);
        setTableData(processedData);
        toast({
          title: "Data loaded",
          description: `Loaded ${processedData.length} appointments.`,
          variant: "default",
        });
      } catch (error) {
        console.error("Error building table data:", error);
        const sampleData = generateTableData();
        setTableData(sampleData);
        toast({
          title: "Error processing data",
          description: "Using sample data instead.",
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
