import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppointmentsTable } from "../components/AppointmentsTable";
import ProduktionsarkHeader from "../components/ProduktionsarkHeader";

export default function ProduktionsarkPage() {
  return (
    <SidebarProvider>
      <div className="flex w-full h-screen">
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col h-full">
            <ProduktionsarkHeader />
            <div className="flex-1 overflow-auto p-4">
              <AppointmentsTable />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
