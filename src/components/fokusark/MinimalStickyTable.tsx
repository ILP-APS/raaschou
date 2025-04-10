
import React, { useState } from 'react';
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
import { toast } from 'sonner';

// Define the column meta type to include our custom properties
interface ColumnMeta {
  sticky?: boolean;
  index?: number;
  groupIndex?: number;
}

interface MinimalStickyTableProps {
  tableData?: string[][];
  onCellChange?: (rowIndex: number, colIndex: number, value: string) => void;
}

export default function MinimalStickyTable({ 
  tableData = [], 
  onCellChange 
}: MinimalStickyTableProps) {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; colIndex: number } | null>(null);
  
  console.log("MinimalStickyTable received data:", {
    rowCount: tableData?.length || 0,
    hasData: tableData && tableData.length > 0,
    firstRow: tableData && tableData.length > 0 ? {
      appointmentNumber: tableData[0][0],
      subject: tableData[0][1],
      responsibleUser: tableData[0][2]
    } : {}
  });
  
  // Transform tableData into usable data for the table
  const data = React.useMemo(() => {
    if (!tableData || tableData.length === 0) {
      console.log("No table data provided, returning empty array");
      return [];
    }
    
    // Convert the 2D array data to objects
    const transformed = tableData.map((row, i) => {
      // Get the appointment number and subject from the row data
      const appointmentNumber = row[0] || `row-${i}`; // This is the actual appointment number from API
      const subject = row[1] || `Project ${i + 1}`; // This is the appointment subject from API
      
      console.log(`Row ${i}: appointmentNumber=${appointmentNumber}, subject=${subject}`);
      
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
    
    console.log(`Transformed ${transformed.length} rows from raw data`);
    if (transformed.length > 0) {
      console.log("First transformed row:", {
        id: transformed[0].id,
        name: transformed[0].name,
        type: transformed[0].type
      });
    }
    return transformed;
  }, [tableData]);
  
  // Function to handle cell edits
  const handleCellEdit = React.useCallback((rowIndex: number, colIndex: number, value: string) => {
    if (onCellChange) {
      onCellChange(rowIndex, colIndex, value);
      toast.success("Cell updated successfully");
    }
  }, [onCellChange]);
  
  // Define columns with proper typing for custom meta properties
  const columns = React.useMemo<ColumnDef<Record<string, string>, any>[]>(() => [
    { 
      accessorKey: 'id', 
      header: 'Nr.', 
      meta: { sticky: true, index: 0, groupIndex: 0 } as ColumnMeta
    },
    { 
      accessorKey: 'name', 
      header: 'Navn', 
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
    
    // Updated to have 5 columns for Group D instead of 2
    ...Array.from({ length: 5 }).map((_, i) => ({
      accessorKey: `col${i + 14}`,
      header: `Group D ${i + 1}`,
      meta: { groupIndex: 6 } as ColumnMeta
    })),
    
    ...Array.from({ length: 2 }).map((_, i) => ({
      accessorKey: `col${i + 19}`,
      header: `Summary ${i + 1}`,
      meta: { groupIndex: 7 } as ColumnMeta
    }))
  ], []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Define group structure with column spans
  const columnGroups = [
    { name: 'Aftale', span: 2, index: 0 },
    { name: '', span: 1, index: 1 },
    { name: 'Budget Group A', span: 5, index: 2 },
    { name: 'Budget Group B', span: 4, index: 3 },
    { name: 'Budget Group C', span: 4, index: 4 },
    { name: 'Special', span: 1, index: 5 },
    { name: 'Budget Group D', span: 5, index: 6 },
    { name: 'Summary', span: 2, index: 7 }
  ];
  
  // Get background color based on group index and theme
  const getGroupBgColor = (groupIndex: number) => {
    if (isDarkMode) {
      return groupIndex % 2 === 0 ? 'hsl(var(--background))' : 'hsl(var(--muted))';
    } else {
      return groupIndex % 2 === 0 ? 'hsl(var(--background))' : 'hsl(var(--muted)/10)';
    }
  };

  const headerHeight = '41px';
  
  // If no data, show appropriate message
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No data to display</h3>
          <p className="text-muted-foreground">
            Please check the data source or try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  console.log(`MinimalStickyTable rendering table with ${data.length} rows of data`);

  return (
    <div className="table-wrapper" style={{
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid hsl(var(--border))',
      borderRadius: '8px',
      height: '600px',
      minHeight: '600px',
      maxHeight: '80vh'
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
                    backgroundColor: getGroupBgColor(index),
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
                      backgroundColor: getGroupBgColor(groupIndex),
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
            {table.getRowModel().rows.map((row, rowIdx) => {
              return (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell, cellIdx) => {
                    const meta = cell.column.columnDef.meta as ColumnMeta | undefined;
                    const isSticky = meta?.sticky;
                    const stickyIndex = meta?.index || 0;
                    const groupIndex = meta?.groupIndex || 0;
                    const isEditing = editingCell?.rowIndex === rowIdx && editingCell?.colIndex === cellIdx;
                    
                    // Make first 2 columns read-only
                    const isReadOnly = cellIdx <= 1;
                    
                    return (
                      <TableCell
                        key={cell.id}
                        onClick={() => {
                          // Handle cell click - this is where we would trigger edit mode
                          if (onCellChange && !isReadOnly) {
                            const colIndex = cellIdx;
                            const value = prompt('Enter new value:', cell.getValue() as string) || '';
                            if (value) {
                              handleCellEdit(rowIdx, colIndex, value);
                            }
                          }
                        }}
                        style={{
                          position: isSticky ? 'sticky' : undefined,
                          left: isSticky ? (stickyIndex === 0 ? 0 : '150px') : undefined,
                          zIndex: isSticky ? 20 : undefined,
                          minWidth: stickyIndex === 0 ? '150px' : (stickyIndex === 1 ? '200px' : '150px'),
                          backgroundColor: getGroupBgColor(groupIndex),
                          boxShadow: isSticky ? '1px 0 0 0 hsl(var(--border))' : undefined,
                          cursor: isReadOnly ? 'default' : 'pointer',
                          fontWeight: isReadOnly ? '500' : 'normal'
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
