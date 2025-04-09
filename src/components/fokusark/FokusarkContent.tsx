
import React from "react";
import FokusarkDescription from "./FokusarkDescription";
import { useFokusarkData } from "@/hooks/useFokusarkData";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableHead
} from "@/components/ui/table";
import "./FokusarkTableStyles.css";

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
    <div className="flex flex-col gap-4 md:p-6 overflow-hidden content-wrapper">
      <div className="flex flex-col gap-4 content-wrapper">
        <h2 className="text-2xl font-semibold tracking-tight">Fokusark</h2>
        <FokusarkDescription />
      </div>
      
      <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm p-0">
        {/* Main scrollable container */}
        <div className="sticky-table-container">
          <Table className="sticky-table">
            <TableHeader>
              {/* First Header Row - Group Headers */}
              <TableRow>
                {/* Column 1 (First sticky column) */}
                <TableHead 
                  data-sticky="true"
                  style={{ left: 0, width: '150px', minWidth: '150px' }}
                  className="font-medium whitespace-nowrap text-center border-r"
                >
                  Group 1
                </TableHead>
                
                {/* Column 2 (Second sticky column) */}
                <TableHead 
                  data-sticky="true"
                  data-last-sticky="true"
                  style={{ left: 150, width: '150px', minWidth: '150px' }}
                  className="font-medium whitespace-nowrap text-center border-r"
                >
                  Group 1
                </TableHead>
                
                {/* Column 3 - Non-sticky part of Group 1 */}
                <TableHead 
                  className="font-medium whitespace-nowrap text-center border-r"
                  colSpan={1}
                  style={{ width: '120px', minWidth: '120px' }}
                >
                  Group 1
                </TableHead>
                
                {/* Group 2: Columns 4-8 */}
                <TableHead 
                  className="font-medium whitespace-nowrap text-center border-r"
                  colSpan={5}
                >
                  Group 2
                </TableHead>
                
                {/* Group 3: Columns 9-14 */}
                <TableHead 
                  className="font-medium whitespace-nowrap text-center border-r"
                  colSpan={6}
                >
                  Group 3
                </TableHead>
                
                {/* Group 4: Columns 15-19 */}
                <TableHead 
                  className="font-medium whitespace-nowrap text-center border-r"
                  colSpan={5}
                >
                  Group 4
                </TableHead>
                
                {/* Group 5: Columns 20-25 */}
                <TableHead 
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
                  
                  // Determine if this is a sticky column
                  const isSticky = i < 2;
                  
                  // Is this the last sticky column?
                  const isLastSticky = i === 1;
                  
                  return (
                    <TableHead 
                      key={`header-${i}`} 
                      className="font-medium whitespace-nowrap border-r"
                      style={{
                        width: `${columnWidth}px`,
                        minWidth: `${columnWidth}px`,
                        left: leftPosition
                      }}
                      data-sticky={isSticky ? "true" : undefined}
                      data-last-sticky={isLastSticky ? "true" : undefined}
                    >
                      Column {i+1}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row, rowIndex) => {
                const rowBgClass = rowIndex % 2 === 0 ? "bg-background" : "bg-muted/20";
                
                return (
                  <TableRow 
                    key={`row-${rowIndex}`} 
                    className={rowBgClass}
                  >
                    {row.map((cell, cellIndex) => {
                      // Fixed width for each column type
                      const columnWidth = cellIndex < 2 ? 150 : 120;
                      
                      // Calculate the left position for sticky columns
                      const leftPosition = cellIndex === 0 ? 0 : (cellIndex === 1 ? 150 : undefined);
                      
                      // Determine if this is a sticky column
                      const isSticky = cellIndex < 2;
                      
                      // Is this the last sticky column?
                      const isLastSticky = cellIndex === 1;
                      
                      return (
                        <TableCell 
                          key={`cell-${rowIndex}-${cellIndex}`} 
                          className="p-2 whitespace-nowrap border-r"
                          style={{
                            width: `${columnWidth}px`,
                            minWidth: `${columnWidth}px`,
                            left: leftPosition
                          }}
                          data-sticky={isSticky ? "true" : undefined}
                          data-last-sticky={isLastSticky ? "true" : undefined}
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
  );
};

export default FokusarkContent;
