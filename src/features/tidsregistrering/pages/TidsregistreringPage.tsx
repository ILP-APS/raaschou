import React from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import TidsregistreringHeader from "../components/TidsregistreringHeader";
import TidsregistreringContent from "../components/TidsregistreringContent";

export default function TidsregistreringPage() {
  return (
    <SidebarProvider>
      <div className="flex w-full h-screen">
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col h-full">
            <TidsregistreringHeader />
            <div className="flex-1 overflow-auto">
              <TidsregistreringContent />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
