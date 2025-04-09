
import { useState, useEffect } from "react";
import { useAppointments } from "./useAppointments";
import { useUsers } from "./useUsers";
import { Appointment } from "@/types/appointment";
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
  const { appointments, isLoading: isLoadingAppointments, error: appointmentsError } = useAppointments();
  const { users, isLoading: isLoadingUsers, error: usersError } = useUsers();
  const { toast } = useToast();
  
  const isLoading = isLoadingAppointments || isLoadingUsers || isProcessing;
  
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
        
        const userMap = createUserMap(users);
        
        const processedData: string[][] = [];
        
        for (const appointment of appointments) {
          try {
            const details = await getAppointmentDetail(appointment.hnAppointmentID);
            
            if (details.done) {
              continue;
            }
            
            const responsibleUserName = userMap.get(details.responsibleHnUserID) || 'Unknown';
            
            const { offerTotal, montageTotal, underleverandorTotal } = 
              await getOfferLineItems(details.hnOfferID);
            
            // Get realized hours from API
            const realizedHours = await getRealizedHours(appointment.hnAppointmentID);
            console.log(`Realized hours for ${appointment.appointmentNumber}:`, realizedHours);
            
            try {
              // Parse realized hours from API
              const projekteringNum = parseFloat(realizedHours.projektering.replace(/\./g, '').replace(',', '.')) || 0;
              const produktionNum = parseFloat(realizedHours.produktion.replace(/\./g, '').replace(',', '.')) || 0;
              const montageNum = parseFloat(realizedHours.montage.replace(/\./g, '').replace(',', '.')) || 0;
              const totalNum = parseFloat(realizedHours.total.replace(/\./g, '').replace(',', '.')) || 0;
              
              console.log(`Storing realized hours for ${appointment.appointmentNumber}:`, {
                projektering: projekteringNum,
                produktion: produktionNum,
                montage: montageNum,
                total: totalNum
              });
              
              // Store realized hours in database - ensure we're using the correct columns
              await updateRealizedHours(
                appointment.appointmentNumber || `${appointment.hnAppointmentID}`,
                projekteringNum,
                produktionNum, // This is the realized production from API
                montageNum,
                totalNum
              );
              
              console.log(`Updated realized hours in Supabase for appointment ${appointment.appointmentNumber}`);
            } catch (updateError) {
              console.error(`Error updating realized hours for ${appointment.appointmentNumber}:`, updateError);
            }
            
            const offerTotalNumber = parseFloat(offerTotal.replace(/[^0-9,]/g, '').replace(',', '.'));
            
            if (offerTotalNumber <= 40000) {
              continue;
            }
            
            // Build the row of data
            const row = [
              appointment.appointmentNumber || `${appointment.hnAppointmentID}`,
              details.subject || 'N/A',
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
              realizedHours.produktion, // This should come from the API, not calculation
              realizedHours.montage, 
              realizedHours.total
            );
            
            // Add remaining placeholder columns
            for (let i = 16; i < 23; i++) {
              row.push(`R${processedData.length + 1}C${i + 1}`);
            }
            
            const isSubApp = isSubAppointment(appointment.appointmentNumber);
            row.push(isSubApp ? 'sub-appointment' : 'parent-appointment');
            
            processedData.push(row);
          } catch (error) {
            console.error(`Error processing appointment ${appointment.hnAppointmentID}:`, error);
            continue;
          }
        }
        
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
