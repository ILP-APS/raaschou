
import React from "react";
import { AppSidebar } from "@/components/AppSidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import FokusarkHeader from "@/components/fokusark/FokusarkHeader";
import FokusarkContent from "@/components/fokusark/FokusarkContent";

export default function FokusarkPage() {
  return (
    <SidebarProvider>
      <div className="flex w-full h-screen">
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col h-full">
            <FokusarkHeader />
            <div className="flex-1 overflow-hidden">
              <FokusarkContent />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
