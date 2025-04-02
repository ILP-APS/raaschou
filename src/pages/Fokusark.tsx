
import React from "react";
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

export default function FokusarkPage() {
  // Generate table data for the Fokusark table
  const tableData = generateTableData();
  
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
              <p className="text-sm text-muted-foreground">
                This table contains 24 columns and 50 rows with scrollable content. Hover over the table to scroll horizontally.
              </p>
            </div>
            
            {/* Now using the dedicated FokusarkTable component */}
            <FokusarkTable data={tableData} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
