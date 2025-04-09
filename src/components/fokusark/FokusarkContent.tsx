
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
  const { isLoading, data } = useFokusarkData();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
  // Generate 25 columns - explicitly defining many columns to ensure scrolling
  const columns = [
    { id: "id", header: "ID", sticky: true, className: "col-id" },
    { id: "name", header: "Name", sticky: true, className: "col-name last-sticky-cell" },
  ];
  
  // Add many more columns to ensure horizontal scrolling is needed
  for (let i = 1; i <= 30; i++) {
    columns.push({
      id: `col${i}`,
      header: `Column ${i}`,
      group: `Group ${Math.ceil(i / 4)}`,
    });
  }
  
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
                className="col-id"
              >
                &nbsp;
              </TableHead>
              <TableHead 
                className="col-name last-sticky-cell"
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
                return (
                  <TableHead 
                    key={column.id}
                    className={column.className || ""}
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
                {columns.map((column) => {
                  return (
                    <TableCell 
                      key={`${rowIndex}-${column.id}`}
                      className={column.className || ""}
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
