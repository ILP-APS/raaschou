
import React from "react";
import { AppSidebar } from "@/components/AppSidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import FokusarkHeader from "@/components/fokusark/FokusarkHeader";
import FokusarkContent from "@/components/fokusark/FokusarkContent";
import { useFokusarkData } from "@/hooks/useFokusarkData";
import { FokusarkDataProvider } from "@/contexts/FokusarkDataContext";

export default function FokusarkPage() {
  const { tableData, isLoading } = useFokusarkData();
  
  return (
    <SidebarProvider>
      <FokusarkDataProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col h-screen page-container">
            <FokusarkHeader />
            <FokusarkContent 
              tableData={tableData} 
              isLoading={isLoading} 
            />
          </div>
        </SidebarInset>
      </FokusarkDataProvider>
    </SidebarProvider>
  );
}
