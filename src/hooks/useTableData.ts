
import { useState, useEffect, useCallback } from "react";
import { useAppointments } from "./useAppointments";
import { useUsers } from "./useUsers";
import { 
  createUserMap, 
  getAppointmentDetail, 
  getOfferLineItems,
  getRealizedHours,
  isSubAppointment 
} from "@/utils/appointmentUtils";
import { generateTableData } from "@/utils/tableData";
import { useToast } from "@/hooks/use-toast";
import { updateRealizedHours } from "@/api/fokusarkAppointmentsApi";

export const useTableData = () => {
  const [tableData, setTableData] = useState<string[][]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { appointments, isLoading: isLoadingAppointments, error: appointmentsError } = useAppointments();
  const { users, isLoading: isLoadingUsers, error: usersError } = useUsers();
  const { toast } = useToast();
  
  const isLoading = isLoadingAppointments || isLoadingUsers || isProcessing;
  
  // Function to manually trigger a data refresh
  const refetchData = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);
  
  useEffect(() => {
    const buildTableData = async () => {
      if (
        (isLoadingAppointments || isLoadingUsers) || 
        (appointmentsError || usersError) || 
        !(appointments.length > 0)
      ) {
        return;
      }
      
      try {
        setIsProcessing(true);
        
        // Debug the appointment data
        console.log("First appointment from useAppointments:", appointments[0]);
        
        const userMap = createUserMap(users);
        
        const processedData: string[][] = [];
        const batchSize = 10;
        const appointmentBatches = [];
        
        // Create batches of appointments
        for (let i = 0; i < appointments.length; i += batchSize) {
          appointmentBatches.push(appointments.slice(i, i + batchSize));
        }
        
        // Process each batch
        for (const batch of appointmentBatches) {
          const batchPromises = batch.map(async (appointment) => {
            try {
              console.log("Processing appointment:", appointment);
              const details = await getAppointmentDetail(appointment.hnAppointmentID);
              
              if (details.done) {
                return null;
              }
              
              // Log the subject from the API
              console.log(`Appointment ${appointment.appointmentNumber} subject:`, details.subject);
              
              const responsibleUserName = userMap.get(details.responsibleHnUserID) || 'Unknown';
              
              const { offerTotal, montageTotal, underleverandorTotal } = 
                await getOfferLineItems(details.hnOfferID);
              
              // Get realized hours from API
              const realizedHours = await getRealizedHours(appointment.hnAppointmentID);
              
              const offerTotalNumber = parseFloat(offerTotal.replace(/[^0-9,]/g, '').replace(',', '.'));
              
              if (offerTotalNumber <= 40000) {
                return null;
              }
              
              // Use the appointmentNumber and subject directly from the API
              console.log("Using appointment number:", appointment.appointmentNumber);
              
              // Build the row of data
              const row = [
                appointment.appointmentNumber, // Use this directly from the API
                details.subject || 'N/A',     // Use the subject from the API
                responsibleUserName,
                offerTotal,
                montageTotal,
                underleverandorTotal,
              ];
              
              row.push('0', '0');
              
              // For columns 8-11 (materialer, projektering, produktion, montage)
              // These are calculated fields, not from API
              for (let i = 8; i < 12; i++) {
                row.push(`R${processedData.length + 1}C${i + 1}`);
              }
              
              // Add the realized values from the API (columns 12-15)
              row.push(
                realizedHours.projektering, 
                realizedHours.produktion,
                realizedHours.montage, 
                realizedHours.total
              );
              
              // Add remaining placeholder columns
              for (let i = 16; i < 23; i++) {
                row.push(`R${processedData.length + 1}C${i + 1}`);
              }
              
              const isSubApp = isSubAppointment(appointment.appointmentNumber);
              row.push(isSubApp ? 'sub-appointment' : 'parent-appointment');
              
              return row;
            } catch (error) {
              console.error(`Error processing appointment ${appointment.hnAppointmentID}:`, error);
              return null;
            }
          });
          
          const batchResults = await Promise.all(batchPromises);
          
          // Filter out null results and add valid rows to processedData
          batchResults.forEach(row => {
            if (row !== null) {
              processedData.push(row);
            }
          });
        }
        
        if (processedData.length === 0) {
          const sampleData = generateTableData();
          console.log("Using sample data, first row:", sampleData[0]);
          setTableData(sampleData);
          toast({
            title: "No matching appointments found",
            description: "No appointments met the criteria (not done and offer > 40,000). Using sample data instead.",
            variant: "default",
          });
        } else {
          console.log("Using API data, first row:", processedData[0]);
          setTableData(processedData);
          toast({
            title: "Data loaded",
            description: `Loaded ${processedData.length} appointments.`,
            variant: "default",
          });
        }
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
        setIsProcessing(false);
      }
    };
    
    buildTableData();
  }, [appointments, users, isLoadingAppointments, isLoadingUsers, appointmentsError, usersError, toast, refreshTrigger]);
  
  return { tableData, isLoading, error: appointmentsError || usersError, refetchData };
};
