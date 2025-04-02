
import { useState, useEffect } from "react";
import { useAppointments } from "./useAppointments";
import { useUsers } from "./useUsers";
import { Appointment } from "@/types/appointment";
import { 
  createUserMap, 
  getAppointmentDetail, 
  getOfferLineItems,
  isSubAppointment 
} from "@/utils/appointmentUtils";
import { generateTableData } from "@/utils/tableData";
import { useToast } from "@/hooks/use-toast";

export const useTableData = () => {
  const [tableData, setTableData] = useState<string[][]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { appointments, isLoading: isLoadingAppointments, error: appointmentsError } = useAppointments();
  const { users, isLoading: isLoadingUsers, error: usersError } = useUsers();
  const { toast } = useToast();
  
  // Combine loading states
  const isLoading = isLoadingAppointments || isLoadingUsers || isProcessing;
  
  useEffect(() => {
    const buildTableData = async () => {
      // Only proceed if we have appointments and users
      if (
        (isLoadingAppointments || isLoadingUsers) || 
        (appointmentsError || usersError) || 
        !(appointments.length > 0)
      ) {
        return;
      }
      
      try {
        setIsProcessing(true);
        
        // Create a map of user IDs to names for quick lookup
        const userMap = createUserMap(users);
        
        // Create an array to hold the processed data
        const processedData: string[][] = [];
        
        // For each appointment, fetch the details to get the subject and responsible user
        for (const appointment of appointments) {
          try {
            // Fetch the appointment details
            const details = await getAppointmentDetail(appointment.hnAppointmentID);
            
            // Skip appointments that are marked as done
            if (details.done) {
              continue;
            }
            
            // Get the responsible user name from the map
            const responsibleUserName = userMap.get(details.responsibleHnUserID) || 'Unknown';
            
            // Get the offer, montage, and underleverandør totals
            const { offerTotal, montageTotal, underleverandorTotal } = 
              await getOfferLineItems(details.hnOfferID);
            
            // Parse the offerTotal to a number for comparison
            // Remove any non-numeric characters (except decimal point) and convert to number
            const offerTotalNumber = parseFloat(offerTotal.replace(/[^0-9,]/g, '').replace(',', '.'));
            
            // Skip appointments with offer total less than or equal to 40,000
            if (offerTotalNumber <= 40000) {
              continue;
            }
            
            // Create a row with the appointment number, subject, responsible user name, 
            // offer total, montage total, and underleverandør total
            const row = [
              appointment.appointmentNumber || `${appointment.hnAppointmentID}`,
              details.subject || 'N/A',
              responsibleUserName,
              offerTotal,
              montageTotal,
              underleverandorTotal,
            ];
            
            // Add remaining columns with placeholder data to match the 24 column structure
            for (let i = 6; i < 24; i++) {
              row.push(`R${processedData.length + 1}C${i + 1}`);
            }
            
            // Add visual indication for sub-appointments
            const isSubApp = isSubAppointment(appointment.appointmentNumber);
            row.push(isSubApp ? 'sub-appointment' : 'parent-appointment');
            
            processedData.push(row);
          } catch (error) {
            console.error(`Error processing appointment ${appointment.hnAppointmentID}:`, error);
            // Skip erroring appointments instead of adding error row
            continue;
          }
        }
        
        // If no appointments meet the criteria, use sample data
        if (processedData.length === 0) {
          setTableData(generateTableData());
          toast({
            title: "No matching appointments found",
            description: "No appointments met the criteria (not done and offer > 40,000). Using sample data instead.",
            variant: "default",
          });
        } else {
          setTableData(processedData);
          toast({
            title: "Filtered data loaded",
            description: `Loaded ${processedData.length} appointments that are not done and have offer > 40,000.`,
            variant: "default",
          });
        }
      } catch (error) {
        console.error("Error building table data:", error);
        // Use generated data as fallback
        setTableData(generateTableData());
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
  }, [appointments, users, isLoadingAppointments, isLoadingUsers, appointmentsError, usersError, toast]);
  
  return { tableData, isLoading: isLoading, error: appointmentsError || usersError };
};
