
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
      
      <div className="rounded-lg border border-border shadow-sm">
        <div className="sticky-table-container">
          <Table className="sticky-table">
            <TableHeader>
              {/* First Header Row - Group Headers */}
              <TableRow>
                {/* First sticky column under Group 1 */}
                <TableHead 
                  rowSpan={1}
                  data-sticky="true"
                  style={{ left: 0, width: '150px' }}
                >
                  Group 1
                </TableHead>
                
                {/* Second sticky column under Group 1 */}
                <TableHead 
                  rowSpan={1}
                  data-sticky="true"
                  data-last-sticky="true"
                  style={{ left: '150px', width: '150px' }}
                >
                  Group 1
                </TableHead>
                
                {/* Remaining column for Group 1 */}
                <TableHead colSpan={1}>
                  Group 1
                </TableHead>
                
                {/* Group 2: Columns 4-8 */}
                <TableHead colSpan={5}>
                  Group 2
                </TableHead>
                
                {/* Group 3: Columns 9-14 */}
                <TableHead colSpan={6}>
                  Group 3
                </TableHead>
                
                {/* Group 4: Columns 15-19 */}
                <TableHead colSpan={5}>
                  Group 4
                </TableHead>
                
                {/* Group 5: Columns 20-25 */}
                <TableHead colSpan={6}>
                  Group 5
                </TableHead>
              </TableRow>
              
              {/* Second Header Row - Column Headers */}
              <TableRow>
                {Array.from({ length: 25 }, (_, i) => {
                  // Fixed width for columns
                  const columnWidth = i < 2 ? '150px' : '120px';
                  
                  // Sticky properties
                  const isSticky = i < 2;
                  const isLastSticky = i === 1;
                  const leftPosition = isSticky ? (i === 0 ? 0 : '150px') : undefined;
                  
                  return (
                    <TableHead 
                      key={`header-${i}`}
                      data-sticky={isSticky ? "true" : undefined}
                      data-last-sticky={isLastSticky ? "true" : undefined}
                      style={{
                        width: columnWidth,
                        left: leftPosition
                      }}
                    >
                      Column {i+1}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row, rowIndex) => (
                <TableRow key={`row-${rowIndex}`}>
                  {row.map((cell, cellIndex) => {
                    // Column properties
                    const columnWidth = cellIndex < 2 ? '150px' : '120px';
                    const isSticky = cellIndex < 2;
                    const isLastSticky = cellIndex === 1;
                    const leftPosition = isSticky ? (cellIndex === 0 ? 0 : '150px') : undefined;
                    
                    return (
                      <TableCell 
                        key={`cell-${rowIndex}-${cellIndex}`}
                        data-sticky={isSticky ? "true" : undefined}
                        data-last-sticky={isLastSticky ? "true" : undefined}
                        style={{
                          width: columnWidth,
                          left: leftPosition
                        }}
                      >
                        {cell}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default FokusarkContent;
