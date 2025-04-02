
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
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
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">Fokusark Table</h2>
            <p className="text-sm text-muted-foreground">
              This table contains 24 columns and 50 rows with scrollable content.
            </p>
          </div>

          <div className="rounded-md border">
            <ScrollArea className="h-[600px]">
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Array.from({ length: 24 }, (_, index) => (
                        <TableHead key={index} className="whitespace-nowrap">
                          Column {index + 1}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <TableCell key={cellIndex} className="whitespace-nowrap">
                            {cell}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
