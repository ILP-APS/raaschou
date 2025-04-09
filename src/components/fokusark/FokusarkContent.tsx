
import React from "react";
import FokusarkDescription from "./FokusarkDescription";
import { useFokusarkData } from "@/hooks/useFokusarkData";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableHead
} from "@/components/ui/table";

const FokusarkContent: React.FC = () => {
  const { isLoading } = useFokusarkData();
  
  // Generate 30 rows and 25 columns of data
  const generateTableData = () => {
    const rows = [];
    for (let i = 0; i < 30; i++) {
      const row = [];
      for (let j = 0; j < 25; j++) {
        row.push(`R${i+1}C${j+1}`);
      }
      rows.push(row);
    }
    return rows;
  };
  
  const tableData = generateTableData();
  
  return (
    <div className="flex flex-col gap-4 md:p-6 overflow-y-auto content-wrapper">
      <div className="flex flex-col gap-4 content-wrapper">
        <h2 className="text-2xl font-semibold tracking-tight">Fokusark</h2>
        <FokusarkDescription />
      </div>
      
      <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm p-0">
        <div className="w-full relative">
          <div className="overflow-x-auto" style={{ maxHeight: '70vh' }}>
            <Table className="relative w-full">
              <TableHeader className="bg-muted/50">
                {/* First Header Row - Group Headers */}
                <TableRow>
                  {/* Group 1: Columns 1-3 - First 2 columns are sticky */}
                  <TableHead 
                    key="group-header-0" 
                    className="font-medium whitespace-nowrap text-center border-r sticky left-0 z-30"
                    colSpan={2}
                    style={{ 
                      backgroundColor: 'hsl(var(--muted)/50)',
                      position: 'sticky',
                      left: 0
                    }}
                  >
                    Group 1 (Sticky)
                  </TableHead>
                  
                  {/* Column 3 - Non-sticky part of Group 1 */}
                  <TableHead 
                    key="group-header-0-rest" 
                    className="font-medium whitespace-nowrap text-center border-r"
                    colSpan={1}
                  >
                    Group 1
                  </TableHead>
                  
                  {/* Group 2: Columns 4-8 */}
                  <TableHead 
                    key="group-header-1" 
                    className="font-medium whitespace-nowrap text-center border-r"
                    colSpan={5}
                  >
                    Group 2
                  </TableHead>
                  
                  {/* Group 3: Columns 9-14 */}
                  <TableHead 
                    key="group-header-2" 
                    className="font-medium whitespace-nowrap text-center border-r"
                    colSpan={6}
                  >
                    Group 3
                  </TableHead>
                  
                  {/* Group 4: Columns 15-19 */}
                  <TableHead 
                    key="group-header-3" 
                    className="font-medium whitespace-nowrap text-center border-r"
                    colSpan={5}
                  >
                    Group 4
                  </TableHead>
                  
                  {/* Group 5: Columns 20-25 */}
                  <TableHead 
                    key="group-header-4" 
                    className="font-medium whitespace-nowrap text-center border-r"
                    colSpan={6}
                  >
                    Group 5
                  </TableHead>
                </TableRow>
                
                {/* Second Header Row - Column Headers */}
                <TableRow>
                  {Array.from({ length: 25 }, (_, i) => {
                    // Fixed width for each column type
                    const columnWidth = i < 2 ? 150 : 120;
                    
                    // Calculate the left position for sticky columns
                    const leftPosition = i === 0 ? 0 : (i === 1 ? 150 : undefined);
                    
                    return (
                      <TableHead 
                        key={`header-${i}`} 
                        className="font-medium whitespace-nowrap"
                        style={{
                          width: `${columnWidth}px`,
                          minWidth: `${columnWidth}px`,
                          ...(i < 2 ? {
                            position: 'sticky',
                            left: leftPosition,
                            zIndex: 30,
                            backgroundColor: 'hsl(var(--muted)/50)'
                          } : {})
                        }}
                      >
                        Column {i+1}
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((row, rowIndex) => {
                  const rowBgColor = rowIndex % 2 === 0 ? 'hsl(var(--background))' : 'hsl(var(--muted)/20)';
                  
                  return (
                    <TableRow 
                      key={`row-${rowIndex}`} 
                      className={rowIndex % 2 === 0 ? "bg-background" : "bg-muted/20"}
                    >
                      {row.map((cell, cellIndex) => {
                        // Fixed width for each column type
                        const columnWidth = cellIndex < 2 ? 150 : 120;
                        
                        // Calculate the left position for sticky columns
                        const leftPosition = cellIndex === 0 ? 0 : (cellIndex === 1 ? 150 : undefined);
                        
                        return (
                          <TableCell 
                            key={`cell-${rowIndex}-${cellIndex}`} 
                            className="p-2 whitespace-nowrap"
                            style={{
                              width: `${columnWidth}px`,
                              minWidth: `${columnWidth}px`,
                              ...(cellIndex < 2 ? {
                                position: 'sticky',
                                left: leftPosition,
                                zIndex: 20,
                                backgroundColor: rowBgColor,
                                ...(cellIndex === 1 ? { boxShadow: '4px 0 4px -2px rgba(0,0,0,0.15)' } : {})
                              } : {})
                            }}
                          >
                            {cell}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FokusarkContent;
