
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
import { fetchAppointmentByNumber, fetchAppointmentDetail } from "@/utils/apiUtils";

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
        console.log(`Processing ${appointments.length} appointments from useAppointments`);
        console.log("First appointment sample:", appointments[0]);
        
        const userMap = createUserMap(users);
        
        const processedData: string[][] = [];
        const batchSize = 20; // Process appointments in batches
        const appointmentBatches = [];
        
        // Create batches of appointments
        for (let i = 0; i < appointments.length; i += batchSize) {
          appointmentBatches.push(appointments.slice(i, i + batchSize));
        }
        
        console.log(`Created ${appointmentBatches.length} batches of appointments`);
        
        // Process each batch
        let counter = 0;
        for (const batch of appointmentBatches) {
          console.log(`Processing batch ${counter + 1}/${appointmentBatches.length}`);
          counter++;
          
          const batchPromises = batch.map(async (appointment) => {
            try {
              // 1. Get appointment number from the appointment
              const appointmentNumber = appointment.appointmentNumber;
              
              // 2. First get appointment details by appointment number to retrieve hnAppointmentID
              const appointmentByNumber = await fetchAppointmentByNumber(appointmentNumber);
              const hnAppointmentID = appointmentByNumber.hnAppointmentID;
              
              if (!hnAppointmentID) {
                console.error(`No hnAppointmentID found for appointment number ${appointmentNumber}`);
                return null;
              }
              
              console.log(`Appointment ${appointmentNumber} has hnAppointmentID: ${hnAppointmentID}`);
              
              // 3. Then get full appointment details using hnAppointmentID
              const details = await fetchAppointmentDetail(hnAppointmentID);
              
              // Skip appointments that are marked as done
              if (details.done) {
                return null;
              }
              
              const responsibleUserName = userMap.get(details.responsibleHnUserID) || 'Unknown';
              
              // Get offer data
              const { offerTotal, montageTotal, underleverandorTotal } = 
                await getOfferLineItems(details.hnOfferID);
              
              // Get realized hours from API
              const realizedHours = await getRealizedHours(appointment.hnAppointmentID);
              
              console.log(`Processing appointment ${appointment.appointmentNumber}: "${details.subject}"`);
              
              // Build the row of data
              const row = [
                appointmentNumber, // Use appointment number from the API
                details.subject || 'N/A',     // Use the subject from the detailed API response
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
              
              const isSubApp = isSubAppointment(appointmentNumber);
              row.push(isSubApp ? 'sub-appointment' : 'parent-appointment');
              
              return row;
            } catch (error) {
              console.error(`Error processing appointment ${appointment.appointmentNumber}:`, error);
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
          console.log("No appointments found that meet criteria. Using sample data, first row:", sampleData[0]);
          setTableData(sampleData);
          toast({
            title: "No valid appointments found",
            description: "Using sample data instead. Try changing the API endpoint or check for API errors.",
            variant: "default",
          });
        } else {
          console.log(`Successfully processed ${processedData.length} appointments from API data`);
          console.log("First processed row sample:", processedData[0]);
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
          description: "Using sample data instead. Check console for error details.",
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
