
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
import { useTheme } from "next-themes";
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
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  
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
      meta: { sticky: true, group: "Info" } as ColumnMeta
    },
    {
      accessorKey: "name",
      header: "Name",
      meta: { sticky: true, group: "Info" } as ColumnMeta
    }
  ];
  
  // Add columns for each group
  let colNum = 1;
  groups.forEach(group => {
    for (let i = 1; i <= group.cols; i++) {
      columns.push({
        accessorKey: `col_${colNum}`,
        header: `${group.name} ${i}`,
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

  // Get background color based on theme
  const getBgColor = (isEvenRow: boolean = false) => {
    if (isDarkMode) {
      return isEvenRow ? 'hsl(var(--muted)/20)' : 'hsl(var(--background))';
    } else {
      return isEvenRow ? 'hsl(var(--muted)/10)' : 'hsl(var(--background))';
    }
  };
  
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-4 pb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Fokusark</h2>
        <FokusarkDescription />
      </div>
      
      <div 
        style={{ 
          position: 'relative',
          overflow: 'auto',
          maxHeight: '70vh',
          border: '1px solid hsl(var(--border))',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <Table>
          <TableHeader>
            {/* Group header row */}
            <TableRow>
              {/* Empty cells for ID and Name columns */}
              <TableHead 
                colSpan={2}
                className={`sticky-header sticky-col-0`}
                style={{ 
                  minWidth: "260px", // Combined width of first two columns
                  width: "260px",
                  backgroundColor: isDarkMode ? 'hsl(var(--muted)/80)' : 'hsl(var(--muted)/80)'
                }}
              >
                Info
              </TableHead>
              
              {/* Group headers */}
              {groups.map((group, index) => (
                <TableHead 
                  key={`group-${index}`} 
                  colSpan={group.cols}
                  style={{
                    backgroundColor: isDarkMode ? 'hsl(var(--muted)/80)' : 'hsl(var(--muted)/80)',
                    textAlign: 'center'
                  }}
                >
                  {group.name}
                </TableHead>
              ))}
            </TableRow>
            
            {/* Column header row */}
            <TableRow>
              {table.getFlatHeaders().map((header, index) => {
                const isSticky = !!(header.column.columnDef.meta as ColumnMeta)?.sticky;
                const stickyClass = isSticky ? (index === 0 ? 'sticky-col-0' : 'sticky-col-1') : '';
                
                return (
                  <TableHead
                    key={header.id}
                    className={`sticky-header ${stickyClass} ${isSticky ? 'sticky-shadow' : ''}`}
                    style={{
                      minWidth: index === 0 ? '80px' : index === 1 ? '180px' : '160px',
                      width: index === 0 ? '80px' : index === 1 ? '180px' : '160px',
                      backgroundColor: isDarkMode ? 'hsl(var(--muted))' : 'hsl(var(--muted))',
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
            {table.getRowModel().rows.map((row, rowIndex) => {
              const isEvenRow = rowIndex % 2 === 1;
              const bgColor = getBgColor(isEvenRow);
              
              return (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell, cellIndex) => {
                    const isSticky = !!(cell.column.columnDef.meta as ColumnMeta)?.sticky;
                    const stickyClass = isSticky ? (cellIndex === 0 ? 'sticky-col-0' : 'sticky-col-1') : '';
                    
                    return (
                      <TableCell
                        key={cell.id}
                        className={`sticky-cell ${stickyClass} ${isSticky ? 'sticky-shadow' : ''}`}
                        style={{
                          minWidth: cellIndex === 0 ? '80px' : cellIndex === 1 ? '180px' : '160px',
                          width: cellIndex === 0 ? '80px' : cellIndex === 1 ? '180px' : '160px',
                          backgroundColor: bgColor,
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
  );
};

export default FokusarkContent;
