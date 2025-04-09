
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

interface ColumnDefinition {
  id: string;
  header: string;
  sticky?: boolean;
  className?: string;
  groupName?: string;
}

const FokusarkContent: React.FC = () => {
  const { tableData, isLoading } = useFokusarkData();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
  // Generate columns - explicitly defining many columns to ensure scrolling
  const columns: ColumnDefinition[] = [
    { id: "id", header: "ID", sticky: true, className: "col-id" },
    { id: "name", header: "Name", sticky: true, className: "col-name last-sticky-cell" },
  ];
  
  // Add many more columns to ensure horizontal scrolling is needed
  for (let i = 1; i <= 30; i++) {
    columns.push({
      id: `col${i}`,
      header: `Column ${i}`,
      groupName: `Group ${Math.ceil(i / 4)}`,
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
    if (!column.groupName) return groups;
    if (!groups[column.groupName]) {
      groups[column.groupName] = [];
    }
    groups[column.groupName].push(column);
    return groups;
  }, {} as Record<string, ColumnDefinition[]>);
  
  const groupNames = Object.keys(columnGroups);
  
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <div className="flex flex-col gap-4 pb-4">
          <h2 className="text-2xl font-semibold tracking-tight">Fokusark</h2>
          <FokusarkDescription />
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
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
                style={{backgroundColor: 'hsl(var(--muted))'}}
              >
                &nbsp;
              </TableHead>
              <TableHead 
                className="col-name last-sticky-cell"
                style={{backgroundColor: 'hsl(var(--muted))'}}
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
              {columns.map((column) => (
                <TableHead 
                  key={column.id}
                  className={column.className || ""}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={`row-${rowIndex}`}>
                {columns.map((column) => (
                  <TableCell 
                    key={`${rowIndex}-${column.id}`}
                    className={column.className || ""}
                  >
                    {row[column.id]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default FokusarkContent;
