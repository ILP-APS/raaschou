
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
  
  const refetchData = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);
  
  useEffect(() => {
    const buildTableData = async () => {
      if (
        (isLoadingAppointments || isLoadingUsers) || 
        (appointmentsError || usersError)
      ) {
        console.log("Still loading or has errors, not building table data yet");
        return;
      }
      
      if (!appointments || appointments.length === 0) {
        console.log("No appointments available");
        const sampleData = generateTableData();
        setTableData(sampleData);
        toast({
          title: "No appointments found",
          description: "No appointments were returned from the API. Using sample data instead.",
          variant: "default",
        });
        return;
      }
      
      try {
        setIsProcessing(true);
        console.log(`Starting to process ${appointments.length} appointments`);
        
        if (appointments.length > 0) {
          console.log("First appointment from useAppointments:", {
            number: appointments[0].appointmentNumber,
            subject: appointments[0].subject, // Log subject explicitly
            id: appointments[0].hnAppointmentID
          });
        }
        
        const userMap = createUserMap(users);
        console.log(`Created user map with ${userMap.size} users`);
        
        const processedData: string[][] = [];
        const batchSize = 10;
        const appointmentBatches = [];
        
        for (let i = 0; i < appointments.length; i += batchSize) {
          appointmentBatches.push(appointments.slice(i, i + batchSize));
        }
        
        console.log(`Created ${appointmentBatches.length} batches of appointments to process`);
        
        for (const batch of appointmentBatches) {
          console.log(`Processing batch of ${batch.length} appointments`);
          
          const batchPromises = batch.map(async (appointment) => {
            try {
              console.log(`Processing appointment ${appointment.appointmentNumber} (ID: ${appointment.hnAppointmentID})`);
              
              if (!appointment.hnAppointmentID) {
                console.log(`Skipping appointment ${appointment.appointmentNumber} - no hnAppointmentID`);
                return null;
              }
              
              const details = await getAppointmentDetail(appointment.hnAppointmentID);
              
              if (details.done) {
                console.log(`Skipping appointment ${appointment.appointmentNumber} - marked as done`);
                return null; // Skip completed appointments
              }
              
              console.log(`Appointment ${appointment.appointmentNumber} subject:`, details.subject);
              
              // Get responsible user name
              const responsibleUserName = userMap.get(details.responsibleHnUserID) || 'Unknown';
              console.log(`Responsible user for appointment ${appointment.appointmentNumber}: ${responsibleUserName}`);
              
              // Get offer line items
              if (!details.hnOfferID) {
                console.log(`Skipping appointment ${appointment.appointmentNumber} - no offer ID`);
                return null;
              }
              
              const { offerTotal, montageTotal, underleverandorTotal } = 
                await getOfferLineItems(details.hnOfferID);
              
              const offerTotalNumber = parseFloat(offerTotal.replace(/\./g, '').replace(',', '.'));
              
              console.log(`Appointment ${appointment.appointmentNumber} offer total: ${offerTotalNumber}`);
              
              // Only include appointments with offer total >= 40,000
              if (offerTotalNumber < 40000) {
                console.log(`Skipping appointment ${appointment.appointmentNumber} - offer total below 40,000`);
                return null;
              }
              
              // Get realized hours
              const realizedHours = await getRealizedHours(appointment.hnAppointmentID);
              
              // Build the row of data
              const row = [
                appointment.appointmentNumber, // Use the real appointment number
                details.subject || 'N/A',      // Use the real subject from API
                responsibleUserName,           // Use the real responsible user
                offerTotal,
                montageTotal,
                underleverandorTotal,
              ];
              
              row.push('0', '0');
              
              for (let i = 8; i < 12; i++) {
                row.push(`R${processedData.length + 1}C${i + 1}`);
              }
              
              row.push(
                realizedHours.projektering, 
                realizedHours.produktion,
                realizedHours.montage, 
                realizedHours.total
              );
              
              for (let i = 16; i < 23; i++) {
                row.push(`R${processedData.length + 1}C${i + 1}`);
              }
              
              const isSubApp = isSubAppointment(appointment.appointmentNumber);
              row.push(isSubApp ? 'sub-appointment' : 'parent-appointment');
              
              console.log(`Successfully processed appointment ${appointment.appointmentNumber}`);
              return row;
            } catch (error) {
              console.error(`Error processing appointment ${appointment.hnAppointmentID}:`, error);
              return null;
            }
          });
          
          const batchResults = await Promise.all(batchPromises);
          
          batchResults.forEach(row => {
            if (row !== null) {
              processedData.push(row);
            }
          });
        }
        
        console.log(`Total appointments processed: ${processedData.length}`);
        
        if (processedData.length === 0) {
          const sampleData = generateTableData();
          console.log("No matching appointments found, using sample data");
          setTableData(sampleData);
          toast({
            title: "No matching appointments found",
            description: "No appointments met the criteria (not done and offer > 40,000). Using sample data instead.",
            variant: "default",
          });
        } else {
          console.log("Using real API data, first row:", {
            appointmentNumber: processedData[0][0],
            subject: processedData[0][1], // Log the subject explicitly
            responsibleUser: processedData[0][2]
          });
          setTableData(processedData);
          toast({
            title: "Data loaded",
            description: `Loaded ${processedData.length} appointments with offer values ≥ 40,000 kr.`,
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
