
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

type ColumnData = {
  id: string;
  header: string;
  group?: string;
}

const FokusarkContent: React.FC = () => {
  const { tableData, isLoading } = useFokusarkData();
  
  // Fixed columns first (ID and Name)
  const columns: ColumnData[] = [
    { id: "id", header: "ID" },
    { id: "name", header: "Name" }
  ];
  
  // Define column groups
  const groups = [
    { name: "Budsjett", cols: 4 },
    { name: "Innkjøp", cols: 3 },
    { name: "Estimert", cols: 4 },
    { name: "Realisert", cols: 3 },
    { name: "Prognoser", cols: 5 },
    { name: "Avvik", cols: 3 }
  ];
  
  // Generate columns for each group
  let colNum = 1;
  groups.forEach(group => {
    for (let i = 1; i <= group.cols; i++) {
      columns.push({
        id: `col_${colNum}`,
        header: `C${colNum}`,
        group: group.name
      });
      colNum++;
    }
  });
  
  // Generate rows of data
  const rows = [];
  for (let i = 1; i <= 30; i++) {
    const row: Record<string, any> = {
      id: `${i}`,
      name: `Project ${i}`
    };
    
    columns.forEach(col => {
      if (col.id !== "id" && col.id !== "name") {
        row[col.id] = `${col.group?.substring(0, 3)}-${i}-${col.id.split('_')[1]}`;
      }
    });
    
    rows.push(row);
  }
  
  // Get unique groups
  const uniqueGroups = Array.from(
    new Set(columns.filter(col => col.group).map(col => col.group))
  );
  
  // Get column span for each group
  const groupSpans: Record<string, number> = {};
  uniqueGroups.forEach(group => {
    if (group) {
      groupSpans[group] = columns.filter(col => col.group === group).length;
    }
  });
  
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
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-4 pb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Fokusark</h2>
        <FokusarkDescription />
      </div>
      
      <div className="sticky-table-container">
        <Table className="sticky-table">
          <TableHeader>
            {/* Group header row */}
            <TableRow>
              {/* Empty cells for ID and Name columns */}
              <TableHead colSpan={2}>&nbsp;</TableHead>
              
              {/* Group headers */}
              {uniqueGroups.map((group, index) => (
                <TableHead key={`group-${index}`} colSpan={groupSpans[group as string]}>
                  {group}
                </TableHead>
              ))}
            </TableRow>
            
            {/* Column header row */}
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={`header-${index}`}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={`row-${rowIndex}`}>
                {columns.map((column, colIndex) => (
                  <TableCell key={`cell-${rowIndex}-${colIndex}`}>
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
