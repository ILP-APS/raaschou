import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppointmentsTable } from "../components/AppointmentsTable";

export default function ProduktionsarkPage() {
  return (
    <SidebarProvider>
      <div className="flex w-full h-screen">
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col h-full">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <h1 className="text-xl font-semibold">Produktionsark</h1>
            </header>
            <div className="flex-1 overflow-auto p-4">
              <AppointmentsTable />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
