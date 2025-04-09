
import React, { useRef } from "react";
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
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
  // Generate columns - explicitly defining many columns
  const columns = [
    { id: "id", header: "ID", sticky: true, className: "col-id" },
    { id: "name", header: "Name", sticky: true, className: "col-name" },
    { id: "col3", header: "Column 3", group: "Group 1" },
    { id: "col4", header: "Column 4", group: "Group 1" },
    { id: "col5", header: "Column 5", group: "Group 1" },
    { id: "col6", header: "Column 6", group: "Group 2" },
    { id: "col7", header: "Column 7", group: "Group 2" },
    { id: "col8", header: "Column 8", group: "Group 2" },
    { id: "col9", header: "Column 9", group: "Group 2" },
    { id: "col10", header: "Column 10", group: "Group 3" },
    { id: "col11", header: "Column 11", group: "Group 3" },
    { id: "col12", header: "Column 12", group: "Group 3" },
    { id: "col13", header: "Column 13", group: "Group 3" },
    { id: "col14", header: "Column 14", group: "Group 4" },
    { id: "col15", header: "Column 15", group: "Group 4" },
    { id: "col16", header: "Column 16", group: "Group 4" },
    { id: "col17", header: "Column 17", group: "Group 4" },
    { id: "col18", header: "Column 18", group: "Group 5" },
    { id: "col19", header: "Column 19", group: "Group 5" },
    { id: "col20", header: "Column 20", group: "Group 5" },
    { id: "col21", header: "Column 21", group: "Group 5" },
    { id: "col22", header: "Column 22", group: "Group 6" },
    { id: "col23", header: "Column 23", group: "Group 6" },
    { id: "col24", header: "Column 24", group: "Group 6" },
    { id: "col25", header: "Column 25", group: "Group 6" },
    { id: "col26", header: "Column 26", group: "Group 7" },
    { id: "col27", header: "Column 27", group: "Group 7" },
    { id: "col28", header: "Column 28", group: "Group 7" },
    { id: "col29", header: "Column 29", group: "Group 7" },
    { id: "col30", header: "Column 30", group: "Group 8" },
    { id: "col31", header: "Column 31", group: "Group 8" },
    { id: "col32", header: "Column 32", group: "Group 8" },
    { id: "col33", header: "Column 33", group: "Group 8" },
    { id: "col34", header: "Column 34", group: "Group 9" },
    { id: "col35", header: "Column 35", group: "Group 9" },
    { id: "col36", header: "Column 36", group: "Group 9" },
    { id: "col37", header: "Column 37", group: "Group 9" },
  ];
  
  // Generate sample data for the table
  const rows = Array.from({ length: 30 }, (_, rowIndex) => {
    return columns.reduce((acc, column, colIndex) => {
      acc[column.id] = `R${rowIndex+1}C${colIndex+1}`;
      return acc;
    }, {} as Record<string, string>);
  });
  
  // Organize columns by group
  const columnGroups = columns.reduce((groups, column) => {
    if (!column.group) return groups;
    if (!groups[column.group]) {
      groups[column.group] = [];
    }
    groups[column.group].push(column);
    return groups;
  }, {} as Record<string, typeof columns>);
  
  const groupNames = Object.keys(columnGroups);
  
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 overflow-hidden h-full">
      <div className="flex flex-col gap-4 pb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Fokusark</h2>
        <FokusarkDescription />
      </div>
      
      <div className="sticky-table-container" ref={tableContainerRef}>
        <Table className="sticky-table">
          <TableHeader>
            {/* Group Headers Row */}
            <TableRow>
              {/* First two columns don't have groups */}
              <TableHead 
                className="sticky-cell col-id" 
                style={{ left: '0px' }}
              >
                &nbsp;
              </TableHead>
              <TableHead 
                className="sticky-cell last-sticky-cell col-name" 
                style={{ left: '80px' }}
              >
                &nbsp;
              </TableHead>
              
              {/* Group headers */}
              {groupNames.map((groupName) => (
                <TableHead 
                  key={groupName}
                  colSpan={columnGroups[groupName].length}
                >
                  {groupName}
                </TableHead>
              ))}
            </TableRow>
            
            {/* Column Headers Row */}
            <TableRow>
              {columns.map((column, colIndex) => {
                let leftPosition: string | undefined;
                let className = '';
                
                if (colIndex === 0) {
                  leftPosition = '0px';
                  className = 'sticky-cell col-id';
                } else if (colIndex === 1) {
                  leftPosition = '80px';
                  className = 'sticky-cell last-sticky-cell col-name';
                } else if (column.className) {
                  className = column.className;
                }
                
                return (
                  <TableHead 
                    key={column.id}
                    className={className}
                    style={colIndex < 2 ? { left: leftPosition } : undefined}
                  >
                    {column.header}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={`row-${rowIndex}`}>
                {columns.map((column, colIndex) => {
                  let leftPosition: string | undefined;
                  let className = '';
                  
                  if (colIndex === 0) {
                    leftPosition = '0px';
                    className = 'sticky-cell col-id';
                  } else if (colIndex === 1) {
                    leftPosition = '80px';
                    className = 'sticky-cell last-sticky-cell col-name';
                  } else if (column.className) {
                    className = column.className;
                  }
                  
                  return (
                    <TableCell 
                      key={`${rowIndex}-${column.id}`}
                      className={className}
                      style={colIndex < 2 ? { left: leftPosition } : undefined}
                    >
                      {row[column.id]}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default FokusarkContent;
