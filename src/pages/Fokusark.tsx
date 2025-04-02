
import React, { useRef, useEffect } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";

// Add CSS styles for table container - focused on fixing the horizontal scroll
const tableContainerStyles = `
  /* The parent container that holds the table */
  .table-scroll-container {
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
  }

  /* Hide scrollbar when not hovering */
  .table-scroll-container:not(:hover)::-webkit-scrollbar {
    height: 0;
    display: none;
  }
  
  .table-scroll-container:not(:hover) {
    scrollbar-width: none;
  }
  
  /* Show scrollbar on hover */
  .table-scroll-container:hover::-webkit-scrollbar {
    display: block;
    height: 6px;
  }
  
  .table-scroll-container:hover::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
  
  /* Ensure vertical scroll container works correctly */
  .table-vertical-scroll {
    height: 600px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  /* Main content styles - prevent unwanted scrolling */
  .main-content {
    overflow-x: hidden !important;
    width: 100%;
  }
  
  /* Headers and other content should not scroll horizontally */
  .content-wrapper {
    overflow-x: hidden;
    max-width: 100%;
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
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const tableVerticalScrollRef = useRef<HTMLDivElement>(null);
  
  // Set up wheel event handling for horizontal scrolling
  useEffect(() => {
    const tableScroll = tableScrollRef.current;
    const tableVerticalScroll = tableVerticalScrollRef.current;
    
    if (!tableScroll || !tableVerticalScroll) return;
    
    const handleWheel = (e: WheelEvent) => {
      // Only process events that originated in the table container
      if (tableScroll.contains(e.target as Node)) {
        // For horizontal scrolling (when Shift key is pressed or when using a trackpad)
        if (e.deltaX !== 0) {
          // Let the browser handle horizontal scroll naturally within the container
          e.stopPropagation();
          return;
        }
        
        // For vertical scrolling within the table
        if (e.deltaY !== 0) {
          // If shift is pressed, convert to horizontal scroll
          if (e.shiftKey) {
            e.preventDefault();
            tableScroll.scrollLeft += e.deltaY;
          } else {
            // Let vertical scroll container handle vertical scrolling
            e.preventDefault();
            tableVerticalScroll.scrollTop += e.deltaY;
          }
        }
      }
    };
    
    // Add event listeners to the table container
    tableScroll.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      tableScroll.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <>
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
              
              <div className="rounded-md border w-full overflow-hidden main-content">
                {/* Vertical scroll container */}
                <div 
                  ref={tableVerticalScrollRef}
                  className="table-vertical-scroll"
                >
                  {/* Horizontal scroll container - THIS IS THE ONLY ELEMENT THAT SHOULD SCROLL HORIZONTALLY */}
                  <div 
                    ref={tableScrollRef}
                    className="table-scroll-container"
                  >
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
