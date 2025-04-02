
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  fetchOpenAppointments, 
  fetchAppointmentDetail, 
  fetchUsers, 
  sortAndGroupAppointments,
  fetchOfferLineItems 
} from "@/utils/apiUtils";
import { generateTableData } from "@/utils/tableData";
import { Appointment, AppointmentDetail, User, OfferLineItem } from "@/types/appointment";

export const useFokusarkData = () => {
  const [tableData, setTableData] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch users first
        const usersList = await fetchUsers();
        setUsers(usersList);
        
        // Create a map of user IDs to names for quick lookup
        const userMap = new Map<number, string>();
        usersList.forEach((user: User) => {
          userMap.set(user.hnUserID, user.name);
        });
        
        // Fetch appointments from the API
        const appointments = await fetchOpenAppointments();
        
        // Sort and group the appointments by their IDs
        const sortedAppointments = sortAndGroupAppointments(appointments);
        
        // Create an array to hold the processed data
        const processedData: string[][] = [];
        
        // For each appointment, fetch the details to get the subject and responsible user
        for (const appointment of sortedAppointments) {
          try {
            // Fetch the appointment details
            const details: AppointmentDetail = await fetchAppointmentDetail(appointment.hnAppointmentID);
            
            // Get the responsible user name from the map
            const responsibleUserName = userMap.get(details.responsibleHnUserID) || 'Unknown';
            
            // Initialize offer total, montage total, and underleverandør total
            let offerTotal = '0';
            let montageTotal = '0';
            let underleverandorTotal = '0';
            
            // If there's an offer ID, fetch the line items
            if (details.hnOfferID) {
              try {
                const lineItems: OfferLineItem[] = await fetchOfferLineItems(details.hnOfferID);
                
                // Calculate the total from all line items
                const total = lineItems.reduce((sum, item) => sum + item.totalPriceStandardCurrency, 0);
                
                // Format the total as a string with thousands separator
                offerTotal = total.toLocaleString('da-DK');
                
                // Calculate the total for montage line items
                const montageItems = lineItems.filter(item => item.itemNumber === "Montage");
                const montageSum = montageItems.reduce((sum, item) => sum + item.totalPriceStandardCurrency, 0);
                
                // Format the montage total as a string with thousands separator
                montageTotal = montageSum > 0 ? montageSum.toLocaleString('da-DK') : '0';
                
                // Calculate the total for underleverandør line items
                const underleverandorItems = lineItems.filter(item => item.itemNumber === "Underleverandør");
                const underleverandorSum = underleverandorItems.reduce((sum, item) => sum + item.totalPriceStandardCurrency, 0);
                
                // Format the underleverandør total as a string with thousands separator
                underleverandorTotal = underleverandorSum > 0 ? underleverandorSum.toLocaleString('da-DK') : '0';
              } catch (error) {
                console.error(`Error fetching offer line items for offer ID ${details.hnOfferID}:`, error);
                offerTotal = 'Error';
                montageTotal = 'Error';
                underleverandorTotal = 'Error';
              }
            }
            
            // Create a row with the appointment number, subject, responsible user name, offer total, montage total, and underleverandør total
            const row = [
              appointment.appointmentNumber || `${appointment.hnAppointmentID}`,
              details.subject || 'N/A',
              responsibleUserName,
              offerTotal,  // Offer total in the 'Tilbud' column
              montageTotal, // Montage total in the 'Montage' column
              underleverandorTotal, // Underleverandør total in the 'Underleverandør' column
            ];
            
            // Determine if this is a sub-appointment
            const isSubAppointment = appointment.appointmentNumber && appointment.appointmentNumber.includes('-');
            
            // Add remaining columns with placeholder data to match the 24 column structure
            for (let i = 6; i < 24; i++) {
              row.push(`R${processedData.length + 1}C${i + 1}`);
            }
            
            // Add visual indication for sub-appointments by adding a class or style
            if (isSubAppointment) {
              // We'll handle the visual styling in the table components
              // Here we just add the data
              row.push('sub-appointment'); // This extra element will be used to identify sub-appointments
            } else {
              row.push('parent-appointment');
            }
            
            processedData.push(row);
          } catch (error) {
            console.error(`Error fetching details for appointment ${appointment.hnAppointmentID}:`, error);
            // Add a row with error information
            const errorRow = [
              appointment.appointmentNumber || `${appointment.hnAppointmentID}`,
              `Error: Could not fetch details`,
              'Unknown',
              '0',  // Default offer total for error rows
              '0',  // Default montage total for error rows
              '0',  // Default underleverandør total for error rows
            ];
            
            // Add remaining columns with placeholder data
            for (let i = 6; i < 24; i++) {
              errorRow.push(`-`);
            }
            
            // Add row type
            const isSubAppointment = appointment.appointmentNumber && appointment.appointmentNumber.includes('-');
            errorRow.push(isSubAppointment ? 'sub-appointment' : 'parent-appointment');
            
            processedData.push(errorRow);
          }
        }
        
        // If no appointments, use sample data
        if (processedData.length === 0) {
          setTableData(generateTableData());
          toast({
            title: "No appointments found",
            description: "Using sample data instead.",
            variant: "default",
          });
        } else {
          setTableData(processedData);
          toast({
            title: "Data loaded",
            description: `Loaded ${processedData.length} appointments.`,
            variant: "default",
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // Use generated data as fallback
        setTableData(generateTableData());
        toast({
          title: "Error loading data",
          description: "Failed to fetch data. Using sample data instead.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [toast]);
  
  return { tableData, isLoading, users };
};
