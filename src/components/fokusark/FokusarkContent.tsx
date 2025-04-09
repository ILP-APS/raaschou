
import React, { useRef, useEffect } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import "./FokusarkTableStyles.css";

const FokusarkContent: React.FC = () => {
  const { isLoading } = useFokusarkData();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
  // Generate sample data for the table - increase column count to create overflow
  const generateTableData = () => {
    const rows = [];
    // Even more columns to ensure horizontal scrolling
    const columnCount = 35;
    
    for (let i = 0; i < 30; i++) {
      const row = [];
      for (let j = 0; j < columnCount; j++) {
        row.push(`R${i+1}C${j+1}`);
      }
      rows.push(row);
    }
    return rows;
  };
  
  const tableData = generateTableData();

  // Group definitions for the header - create more groups for more columns
  const headerGroups = [
    { name: "Group 1", colSpan: 2 }, // For the sticky columns
    { name: "Group 2", colSpan: 4 },
    { name: "Group 3", colSpan: 5 },
    { name: "Group 4", colSpan: 5 },
    { name: "Group 5", colSpan: 5 },
    { name: "Group 6", colSpan: 5 },
    { name: "Group 7", colSpan: 5 },
    { name: "Group 8", colSpan: 4 },
  ];

  // Effect to sync horizontal scroll between frozen and main content
  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    // Force a reflow to ensure sticky positioning works correctly and enable scrolling
    setTimeout(() => {
      if (container) {
        container.scrollLeft = 0;
        container.scrollLeft = 1;
        container.scrollLeft = 0;
      }
    }, 100);
  }, []);
  
  return (
    <div className="flex flex-col gap-4 md:p-6 overflow-hidden h-full">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">Fokusark</h2>
        <FokusarkDescription />
      </div>
      
      <div className="rounded-lg shadow-sm flex-1 overflow-hidden"> 
        <div className="sticky-table-container" ref={tableContainerRef}>
          <Table className="sticky-table">
            <TableHeader>
              {/* Group Headers Row */}
              <TableRow>
                {/* Fixed first two columns */}
                <TableHead 
                  className="sticky-cell col-id"
                  style={{ left: '0px' }}
                  colSpan={1}
                >
                  ID
                </TableHead>
                <TableHead 
                  className="sticky-cell last-sticky-cell col-name"
                  style={{ left: '180px' }}
                  colSpan={1}
                >
                  Name
                </TableHead>
                
                {/* Scrollable column groups */}
                {headerGroups.slice(1).map((group, groupIndex) => (
                  <TableHead 
                    key={`group-${groupIndex + 1}`} 
                    colSpan={group.colSpan}
                  >
                    {group.name}
                  </TableHead>
                ))}
              </TableRow>
              
              {/* Column Headers Row */}
              <TableRow>
                {Array.from({ length: 35 }, (_, i) => {
                  // Define styling for sticky columns
                  const isFirst = i === 0;
                  const isSecond = i === 1;
                  const isSticky = isFirst || isSecond;
                  const isLastSticky = isSecond;
                  
                  // Position values for sticky columns
                  const leftPosition = isFirst ? '0px' : isSecond ? '180px' : undefined;
                  
                  // Apply appropriate classes
                  const className = `
                    ${isSticky ? 'sticky-cell' : ''}
                    ${isLastSticky ? 'last-sticky-cell' : ''}
                    ${isFirst ? 'col-id' : ''}
                    ${isSecond ? 'col-name' : ''}
                  `.trim();
                  
                  return (
                    <TableHead 
                      key={`header-${i}`}
                      className={className}
                      style={isSticky ? { left: leftPosition } : undefined}
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
                    // Define styling for sticky columns
                    const isFirst = cellIndex === 0;
                    const isSecond = cellIndex === 1;
                    const isSticky = isFirst || isSecond;
                    const isLastSticky = isSecond;
                    
                    // Position values for sticky columns
                    const leftPosition = isFirst ? '0px' : isSecond ? '180px' : undefined;
                    
                    // Apply appropriate classes
                    const className = `
                      ${isSticky ? 'sticky-cell' : ''}
                      ${isLastSticky ? 'last-sticky-cell' : ''}
                      ${isFirst ? 'col-id' : ''}
                      ${isSecond ? 'col-name' : ''}
                    `.trim();
                    
                    return (
                      <TableCell 
                        key={`cell-${rowIndex}-${cellIndex}`}
                        className={className}
                        style={isSticky ? { left: leftPosition } : undefined}
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
