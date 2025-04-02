
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

// Add CSS styles for table container
const tableContainerStyles = `
  .table-container {
    overflow-x: hidden; /* Hide horizontal scrollbar by default */
    transition: overflow-x 0.2s ease; /* Smooth transition */
  }

  .table-container:hover {
    overflow-x: auto; /* Show scrollbar and enable scrolling on hover */
  }

  /* Scrollbar styling */
  .table-container {
    scrollbar-width: thin; /* Firefox */
  }
  
  .table-container::-webkit-scrollbar {
    height: 6px; /* Chrome, Edge, Safari */
  }
  
  .table-container::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
`;

export default function FokusarkPage() {
  // Generate table data - 50 rows, 24 columns
  const generateTableData = () => {
    const rows = [];
    for (let i = 1; i <= 50; i++) {
      const row = [];
      for (let j = 1; j <= 24; j++) {
        row.push(`R${i}C${j}`);
      }
      rows.push(row);
    }
    return rows;
  };
  
  const tableData = generateTableData();

  return (
    <>
      {/* Inject CSS styles */}
      <style>{tableContainerStyles}</style>
      
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col h-screen overflow-hidden">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 z-10 bg-background">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">
                      Operations
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Fokusark</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <div className="flex flex-col gap-4 p-4 md:p-6 overflow-y-auto">
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold tracking-tight">Fokusark Table</h2>
                <p className="text-sm text-muted-foreground">
                  This table contains 24 columns and 50 rows with scrollable content. Hover over the table to scroll horizontally.
                </p>
              </div>
              <div className="rounded-md border w-full overflow-hidden">
                <div className="h-[600px] overflow-y-auto">
                  {/* Apply the table-container class */}
                  <div className="table-container w-full">
                    <table className="min-w-[1600px] table-auto border-collapse divide-y divide-border">
                      <thead className="bg-muted/50">
                        <tr>
                          {Array.from({ length: 24 }, (_, index) => (
                            <th 
                              key={index} 
                              className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap sticky top-0 bg-background border-b"
                            >
                              Column {index + 1}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-background divide-y divide-border">
                        {tableData.map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-muted/50">
                            {row.map((cell, cellIndex) => (
                              <td 
                                key={cellIndex} 
                                className="px-4 py-3 whitespace-nowrap text-sm"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
