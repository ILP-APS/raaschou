
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
  
  // Simplified groups for the demonstration
  const groups = [
    { name: "Group A", cols: 3 },
    { name: "Group B", cols: 3 },
    { name: "Group C", cols: 3 }
  ];
  
  // Generate a smaller sample of rows
  const rows: FokusarkRow[] = [];
  for (let i = 1; i <= 10; i++) {
    const row: FokusarkRow = {
      id: `${i}`,
      name: `Project ${i}`
    };
    
    // Add data for each column
    let colNum = 1;
    groups.forEach(group => {
      for (let j = 1; j <= group.cols; j++) {
        row[`col_${colNum}`] = `${group.name.substring(0, 3)}-${i}-${j}`;
        colNum++;
      }
    });
    
    rows.push(row);
  }
  
  // Define columns with explicit sticky styling
  const columns: ColumnDef<FokusarkRow>[] = [
    {
      accessorKey: "id",
      header: "ID",
      meta: { sticky: true, group: "Info" } as ColumnMeta,
      size: 80,
      cell: info => info.getValue() as string
    },
    {
      accessorKey: "name",
      header: "Name",
      meta: { sticky: true, group: "Info" } as ColumnMeta,
      size: 180,
      cell: info => info.getValue() as string
    }
  ];
  
  // Add simplified columns for each group
  let colNum = 1;
  groups.forEach(group => {
    for (let i = 1; i <= group.cols; i++) {
      columns.push({
        accessorKey: `col_${colNum}`,
        header: `${group.name} ${i}`,
        size: 160,
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
  
  // Get header cell background color
  const getHeaderBgColor = () => {
    return isDarkMode ? 'hsl(var(--muted))' : 'hsl(var(--muted))';
  };
  
  // Get corner cell background color
  const getCornerBgColor = () => {
    return isDarkMode ? 'hsl(var(--muted)/80)' : 'hsl(var(--muted)/80)';
  };
  
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-4 pb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Fokusark</h2>
        <FokusarkDescription />
      </div>
      
      <div className="fokusark-table-container">
        <Table style={{ 
          tableLayout: 'fixed', 
          borderCollapse: 'separate',
          width: 'auto',
          minWidth: '100%'
        }}>
          <TableHeader>
            {/* Group header row */}
            <TableRow>
              {/* Corner cell for ID and Name columns */}
              <TableHead 
                colSpan={2}
                className="sticky-corner sticky-col-0 bg-enforce"
                style={{ 
                  minWidth: "260px",
                  width: "260px",
                  backgroundColor: getCornerBgColor()
                }}
              >
                Info
              </TableHead>
              
              {/* Group headers */}
              {groups.map((group, index) => (
                <TableHead 
                  key={`group-${index}`} 
                  colSpan={group.cols}
                  className="sticky-header bg-enforce"
                  style={{
                    backgroundColor: getCornerBgColor(),
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
                const stickyClass = isSticky ? 
                  (index === 0 ? "sticky-column sticky-col-0" : "sticky-column sticky-col-1") : "";
                const cellWidth = header.column.getSize();
                
                return (
                  <TableHead
                    key={header.id}
                    className={`${stickyClass} bg-enforce`}
                    style={{
                      minWidth: `${cellWidth}px`,
                      width: `${cellWidth}px`,
                      backgroundColor: getHeaderBgColor(),
                      top: '41px',
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
                    const stickyClass = isSticky ? 
                      (cellIndex === 0 ? "sticky-column sticky-col-0" : "sticky-column sticky-col-1") : "";
                    const cellWidth = cell.column.getSize();
                    
                    return (
                      <TableCell
                        key={cell.id}
                        className={`${stickyClass} bg-enforce`}
                        style={{
                          minWidth: `${cellWidth}px`,
                          width: `${cellWidth}px`,
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
