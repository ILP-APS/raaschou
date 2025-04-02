
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
import { fetchOpenAppointments } from "@/utils/apiUtils";
import { useToast } from "@/hooks/use-toast";
import { Appointment } from "@/types/appointment";

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
        
        // Process the appointment data to match our table format
        const processedData = appointments.map((appointment: Appointment, index: number) => {
          // Create a row with the appointment number and customer name in first two columns
          const row = [
            appointment.appointmentNumber || `${index + 1}`, 
            appointment.customerAddress.name || 'N/A'
          ];
          
          // Add remaining columns with placeholder data to match the 24 column structure
          for (let i = 2; i < 24; i++) {
            row.push(`R${index + 1}C${i + 1}`);
          }
          
          return row;
        });
        
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
                This table displays open appointments from e-regnskab with Nr. and Name in the first two columns.
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
