import React, { useEffect } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTheme } from 'next-themes';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Define the column meta type to include our custom properties
interface ColumnMeta {
  sticky?: boolean;
  index?: number;
  groupIndex?: number;
}

interface MinimalStickyTableProps {
  tableData?: string[][];
}

export default function MinimalStickyTable({ tableData = [] }: MinimalStickyTableProps) {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  
  // Debug logs to track data
  useEffect(() => {
    console.log("MinimalStickyTable received data:", {
      rowCount: tableData?.length || 0,
      hasData: Boolean(tableData && tableData.length > 0),
      firstRow: tableData && tableData.length > 0 ? tableData[0]?.slice(0, 3) : 'No data'
    });
  }, [tableData]);
  
  // Transform tableData into usable data for the table
  const data = React.useMemo(() => {
    if (!tableData || tableData.length === 0) {
      console.log("No table data provided to MinimalStickyTable");
      return [];
    }
    
    // Log first few rows to see actual data structure
    console.log("Transforming table data structure (first 2 rows):", 
      tableData.slice(0, 2));
    
    // Convert the 2D array data to objects
    return tableData.map((row, i) => {
      // Get the appointment number and subject from the row data
      const appointmentNumber = row[0] || `${i + 1}`; // This is the actual appointment number from API
      const subject = row[1] || `Project ${i + 1}`; // This is the appointment subject from API
      
      console.log(`Row ${i}: appointment number = ${appointmentNumber}, subject = ${subject}`);
      
      const rowObj: Record<string, string> = {
        id: appointmentNumber, // Use the actual appointment number as id
        name: subject, // Use the actual subject from API data
        type: row[2] || `Type ${i % 4 + 1}`, // Responsible person
      };
      
      // Add remaining columns
      for (let j = 3; j < Math.min(row.length, 20); j++) {
        rowObj[`col${j-3}`] = row[j] || `Value ${i}-${j}`;
      }
      
      return rowObj;
    });
  }, [tableData]);
  
  // Define columns with proper typing for custom meta properties
  const columns = React.useMemo<ColumnDef<Record<string, string>, any>[]>(() => [
    { 
      accessorKey: 'id', 
      header: 'ID',
      meta: { sticky: true, index: 0, groupIndex: 0 } as ColumnMeta
    },
    { 
      accessorKey: 'name', 
      header: 'Name',
      meta: { sticky: true, index: 1, groupIndex: 0 } as ColumnMeta
    },
    { 
      accessorKey: 'type', 
      header: 'Type',
      meta: { groupIndex: 1 } as ColumnMeta
    },
    
    // Generate additional columns with group indices
    ...Array.from({ length: 5 }).map((_, i) => ({
      accessorKey: `col${i}`,
      header: `Group A ${i + 1}`,
      meta: { groupIndex: 2 } as ColumnMeta
    })),
    
    ...Array.from({ length: 4 }).map((_, i) => ({
      accessorKey: `col${i + 5}`,
      header: `Group B ${i + 1}`,
      meta: { groupIndex: 3 } as ColumnMeta
    })),
    
    ...Array.from({ length: 4 }).map((_, i) => ({
      accessorKey: `col${i + 9}`,
      header: `Group C ${i + 1}`,
      meta: { groupIndex: 4 } as ColumnMeta
    })),
    
    {
      accessorKey: `col13`,
      header: `Special`,
      meta: { groupIndex: 5 } as ColumnMeta
    },
    
    ...Array.from({ length: 2 }).map((_, i) => ({
      accessorKey: `col${i + 14}`,
      header: `Group D ${i + 1}`,
      meta: { groupIndex: 6 } as ColumnMeta
    })),
    
    ...Array.from({ length: 2 }).map((_, i) => ({
      accessorKey: `col${i + 16}`,
      header: `Summary ${i + 1}`,
      meta: { groupIndex: 7 } as ColumnMeta
    }))
  ], []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (data.length === 0) {
    console.log("No data to display in MinimalStickyTable");
    return (
      <div className="table-wrapper bg-background border border-border rounded-md p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No data available</AlertTitle>
          <AlertDescription>
            The table doesn't have any data to display. This could be due to an error in data loading or transformation.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Define group structure with column spans
  const columnGroups = [
    { name: 'Aftale', span: 2, index: 0 },
    { name: '', span: 1, index: 1 },
    { name: 'Budget Group A', span: 5, index: 2 },
    { name: 'Budget Group B', span: 4, index: 3 },
    { name: 'Budget Group C', span: 4, index: 4 },
    { name: 'Special', span: 1, index: 5 },
    { name: 'Budget Group D', span: 2, index: 6 },
    { name: 'Summary', span: 2, index: 7 }
  ];
  
  // Get background color based on group index and theme
  const getGroupBgColor = (groupIndex: number, isDarkMode: boolean) => {
    if (isDarkMode) {
      return groupIndex % 2 === 0 ? 'hsl(var(--background))' : 'hsl(var(--muted))';
    } else {
      return groupIndex % 2 === 0 ? 'hsl(var(--background))' : 'hsl(var(--muted)/10)';
    }
  };

  const headerHeight = '41px';

  return (
    <div className="table-wrapper" style={{
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid hsl(var(--border))',
      borderRadius: '8px'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}>
        <Table style={{ 
          width: 'auto',
          minWidth: '100%'
        }}>
          <TableHeader>
            {/* Group Header Row */}
            <TableRow>
              {columnGroups.map((group, index) => (
                <TableHead
                  key={`group-${index}`}
                  colSpan={group.span}
                  style={{
                    position: 'sticky',
                    top: 0,
                    left: index === 0 ? 0 : undefined,
                    zIndex: index === 0 ? 60 : 50,
                    backgroundColor: getGroupBgColor(index, isDarkMode),
                    textAlign: 'center',
                    fontWeight: 'bold',
                    borderBottom: '1px solid hsl(var(--border))',
                    minWidth: index === 0 ? '350px' : undefined,
                    boxShadow: index === 0 
                      ? '1px 0 0 0 hsl(var(--border)), 0 1px 0 0 hsl(var(--border))' 
                      : '0 1px 0 0 hsl(var(--border))'
                  }}
                >
                  {group.name}
                </TableHead>
              ))}
            </TableRow>
            
            {/* Column Header Row */}
            <TableRow>
              {table.getFlatHeaders().map((header) => {
                const meta = header.column.columnDef.meta as ColumnMeta | undefined;
                const isSticky = meta?.sticky;
                const stickyIndex = meta?.index || 0;
                const groupIndex = meta?.groupIndex || 0;
                
                return (
                  <TableHead
                    key={header.id}
                    style={{
                      position: 'sticky',
                      top: headerHeight,
                      left: isSticky ? (stickyIndex === 0 ? 0 : '150px') : undefined,
                      zIndex: isSticky ? 55 : 45,
                      minWidth: stickyIndex === 0 ? '150px' : (stickyIndex === 1 ? '200px' : '150px'),
                      backgroundColor: getGroupBgColor(groupIndex, isDarkMode),
                      boxShadow: isSticky ? 
                        '1px 0 0 0 hsl(var(--border)), 0 1px 0 0 hsl(var(--border))' : 
                        '0 1px 0 0 hsl(var(--border))'
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
            {table.getRowModel().rows.map((row) => {
              return (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as ColumnMeta | undefined;
                    const isSticky = meta?.sticky;
                    const stickyIndex = meta?.index || 0;
                    const groupIndex = meta?.groupIndex || 0;
                    
                    return (
                      <TableCell
                        key={cell.id}
                        style={{
                          position: isSticky ? 'sticky' : undefined,
                          left: isSticky ? (stickyIndex === 0 ? 0 : '150px') : undefined,
                          zIndex: isSticky ? 20 : undefined,
                          minWidth: stickyIndex === 0 ? '150px' : (stickyIndex === 1 ? '200px' : '150px'),
                          backgroundColor: getGroupBgColor(groupIndex, isDarkMode),
                          boxShadow: isSticky ? '1px 0 0 0 hsl(var(--border))' : undefined
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
}

// Helper function for getting background color based on group index and theme
function getGroupBgColor(groupIndex: number, isDarkMode: boolean) {
  if (isDarkMode) {
    return groupIndex % 2 === 0 ? 'hsl(var(--background))' : 'hsl(var(--muted))';
  } else {
    return groupIndex % 2 === 0 ? 'hsl(var(--background))' : 'hsl(var(--muted)/10)';
  }
}
