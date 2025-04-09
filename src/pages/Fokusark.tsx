
import React from "react";
import { AppSidebar } from "@/components/AppSidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import FokusarkHeader from "@/components/fokusark/FokusarkHeader";
import FokusarkContent from "@/components/fokusark/FokusarkContent";
import { FokusarkDataProvider } from "@/contexts/FokusarkDataContext";

export default function FokusarkPage() {
  return (
    <SidebarProvider>
      <FokusarkDataProvider>
        <div className="flex w-full relative">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-col h-screen page-container">
              <FokusarkHeader />
              <FokusarkContent />
            </div>
          </SidebarInset>
        </div>
      </FokusarkDataProvider>
    </SidebarProvider>
  );
}
