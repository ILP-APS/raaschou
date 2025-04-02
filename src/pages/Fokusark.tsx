
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
import { fetchOpenAppointments, fetchAppointmentDetail, sortAndGroupAppointments } from "@/utils/apiUtils";
import { useToast } from "@/hooks/use-toast";
import { Appointment, AppointmentDetail } from "@/types/appointment";

export default function FokusarkPage() {
  const [tableData, setTableData] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Fetch appointments from the API
        const appointments = await fetchOpenAppointments();
        
        // Sort and group the appointments by their IDs
        const sortedAppointments = sortAndGroupAppointments(appointments);
        
        // Create an array to hold the processed data
        const processedData: string[][] = [];
        
        // For each appointment, fetch the details to get the subject
        for (const appointment of sortedAppointments) {
          try {
            // Fetch the appointment details
            const details = await fetchAppointmentDetail(appointment.hnAppointmentID);
            
            // Create a row with the appointment number and subject in first two columns
            const row = [
              appointment.appointmentNumber || `${appointment.hnAppointmentID}`,
              details.subject || 'N/A'
            ];
            
            // Determine if this is a sub-appointment
            const isSubAppointment = appointment.appointmentNumber && appointment.appointmentNumber.includes('-');
            
            // Add remaining columns with placeholder data to match the 24 column structure
            for (let i = 2; i < 24; i++) {
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
              `Error: Could not fetch details`
            ];
            
            // Add remaining columns with placeholder data
            for (let i = 2; i < 24; i++) {
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
        console.error("Error fetching appointments:", error);
        // Use generated data as fallback
        setTableData(generateTableData());
        toast({
          title: "Error loading data",
          description: "Failed to fetch appointments. Using sample data instead.",
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
        {/* Added page-container class to block any horizontal overflow at root level */}
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
                This table displays open appointments from e-regnskab with Nr. and Subject in the first two columns.
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
