import React, { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import FokusarkTable from "@/components/FokusarkTable";
import { generateTableData } from "@/utils/tableData";
import { 
  fetchOpenAppointments, 
  fetchAppointmentDetail, 
  fetchUsers, 
  sortAndGroupAppointments,
  fetchOfferLineItems 
} from "@/utils/apiUtils";
import { useToast } from "@/hooks/use-toast";
import { Appointment, AppointmentDetail, User, OfferLineItem } from "@/types/appointment";

export default function FokusarkPage() {
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
            
            // Initialize offer total and montage total
            let offerTotal = '0';
            let montageTotal = '0';
            
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
              } catch (error) {
                console.error(`Error fetching offer line items for offer ID ${details.hnOfferID}:`, error);
                offerTotal = 'Error';
                montageTotal = 'Error';
              }
            }
            
            // Create a row with the appointment number, subject, responsible user name, offer total, and montage total
            const row = [
              appointment.appointmentNumber || `${appointment.hnAppointmentID}`,
              details.subject || 'N/A',
              responsibleUserName,
              offerTotal,  // Offer total in the 'Tilbud' column
              montageTotal, // Montage total in the 'Montage' column
            ];
            
            // Determine if this is a sub-appointment
            const isSubAppointment = appointment.appointmentNumber && appointment.appointmentNumber.includes('-');
            
            // Add remaining columns with placeholder data to match the 24 column structure
            for (let i = 5; i < 24; i++) {
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
            ];
            
            // Add remaining columns with placeholder data
            for (let i = 5; i < 24; i++) {
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
  
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-col h-screen page-container">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 z-10 bg-background content-wrapper">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Operations</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Fokusark</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          
          <div className="flex flex-col gap-4 p-4 md:p-6 overflow-y-auto content-wrapper">
            <div className="flex flex-col gap-4 content-wrapper">
              <h2 className="text-2xl font-semibold tracking-tight">Fokusark Table</h2>
              <p className="text-sm text-muted-foreground mb-6">
                This table displays open appointments from e-regnskab with Nr., Subject, and Responsible Person.
                Sub-appointments are grouped with their parent appointments.
              </p>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <FokusarkTable data={tableData} />
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
