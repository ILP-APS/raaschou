
import React from "react";
import FokusarkDescription from "./FokusarkDescription";
import { useFokusarkData } from "@/hooks/useFokusarkData";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableHead
} from "@/components/ui/table";
import "./FokusarkTableStyles.css";

// Define column metadata type
interface ColumnMeta {
  sticky?: boolean;
  group?: string;
}

// Define row data type
interface FokusarkRow {
  [key: string]: string | number;
  id: string;
  name: string;
}

const FokusarkContent: React.FC = () => {
  const { tableData, isLoading } = useFokusarkData();
  
  // Define column groups
  const groups = [
    { name: "Budsjett", cols: 4 },
    { name: "Innkjøp", cols: 3 },
    { name: "Estimert", cols: 4 },
    { name: "Realisert", cols: 3 },
    { name: "Prognoser", cols: 5 },
    { name: "Avvik", cols: 3 }
  ];
  
  // Generate rows of data
  const rows: FokusarkRow[] = [];
  for (let i = 1; i <= 30; i++) {
    const row: FokusarkRow = {
      id: `${i}`,
      name: `Project ${i}`
    };
    
    // Add data for each column
    let colNum = 1;
    groups.forEach(group => {
      for (let j = 1; j <= group.cols; j++) {
        row[`col_${colNum}`] = `${group.name.substring(0, 3)}-${i}-${colNum}`;
        colNum++;
      }
    });
    
    rows.push(row);
  }
  
  // Define columns
  const columns: ColumnDef<FokusarkRow>[] = [
    {
      accessorKey: "id",
      header: "ID",
      meta: { sticky: true } as ColumnMeta
    },
    {
      accessorKey: "name",
      header: "Name",
      meta: { sticky: true } as ColumnMeta
    }
  ];
  
  // Add columns for each group
  let colNum = 1;
  groups.forEach(group => {
    for (let i = 1; i <= group.cols; i++) {
      columns.push({
        accessorKey: `col_${colNum}`,
        header: `C${colNum}`,
        meta: { group: group.name } as ColumnMeta
      });
      colNum++;
    }
  });
  
  // Create the table instance
  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel()
  });
  
  // Calculate the left position for sticky columns
  const getLeftPosition = (columnIndex: number) => {
    if (columnIndex === 0) return 0;
    if (columnIndex === 1) return 80; // Width of first column
    return undefined;
  };
  
  // Get unique groups for the header row
  const uniqueGroups = Array.from(
    new Set(columns.filter(col => (col.meta as ColumnMeta)?.group).map(col => (col.meta as ColumnMeta)?.group))
  );
  
  // Calculate column spans for each group
  const groupSpans: Record<string, number> = {};
  uniqueGroups.forEach(group => {
    if (group) {
      groupSpans[group] = columns.filter(col => (col.meta as ColumnMeta)?.group === group).length;
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
              <TableHead 
                colSpan={2}
                className="sticky-cell sticky-col-0"
                style={{ 
                  left: 0,
                  minWidth: "260px", // Combined width of first two columns
                  width: "260px",
                  zIndex: 40
                }}
              >
                &nbsp;
              </TableHead>
              
              {/* Group headers */}
              {uniqueGroups.map((group, index) => (
                <TableHead key={`group-${index}`} colSpan={groupSpans[group as string]}>
                  {group}
                </TableHead>
              ))}
            </TableRow>
            
            {/* Column header row */}
            <TableRow>
              {table.getFlatHeaders().map((header, index) => {
                const isSticky = !!(header.column.columnDef.meta as ColumnMeta)?.sticky;
                
                return (
                  <TableHead
                    key={header.id}
                    className={`
                      ${isSticky ? 'sticky-cell' : ''}
                      ${index === 0 ? 'sticky-col-0' : ''}
                      ${index === 1 ? 'sticky-col-1' : ''}
                    `}
                    style={{
                      position: isSticky ? 'sticky' : 'static',
                      left: isSticky ? getLeftPosition(index) : undefined
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell, index) => {
                  const isSticky = !!(cell.column.columnDef.meta as ColumnMeta)?.sticky;
                  
                  return (
                    <TableCell
                      key={cell.id}
                      className={`
                        ${isSticky ? 'sticky-cell' : ''}
                        ${index === 0 ? 'sticky-col-0' : ''}
                        ${index === 1 ? 'sticky-col-1' : ''}
                      `}
                      style={{
                        position: isSticky ? 'sticky' : 'static',
                        left: isSticky ? getLeftPosition(index) : undefined
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
