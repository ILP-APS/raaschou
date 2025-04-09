
import React from "react";
import { AppSidebar } from "@/components/AppSidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import FokusarkHeader from "@/components/fokusark/FokusarkHeader";
import FokusarkContent from "@/components/fokusark/FokusarkContent";
import "@/components/fokusark/FokusarkTableStyles.css";

export default function FokusarkPage() {
  return (
    <SidebarProvider>
      <div className="flex w-full relative h-screen overflow-hidden">
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col h-full overflow-hidden">
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
