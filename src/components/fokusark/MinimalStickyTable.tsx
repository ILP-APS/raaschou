
import React from 'react';
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

// Define the column meta type to include our custom properties
interface ColumnMeta {
  sticky?: boolean;
  index?: number;
}

interface MinimalStickyTableProps {
  tableData?: string[][];
}

export default function MinimalStickyTable({ tableData = [] }: MinimalStickyTableProps) {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  
  // Transform tableData into usable data for the table
  const data = React.useMemo(() => {
    if (!tableData || tableData.length === 0) {
      // Provide default data if none is passed
      return [
        { id: '1', name: 'Project 1', type: 'Type 1', col1: 'Value 1-1', col2: 'Value 1-2', col3: 'Value 1-3' },
        { id: '2', name: 'Project 2', type: 'Type 2', col1: 'Value 2-1', col2: 'Value 2-2', col3: 'Value 2-3' },
        { id: '3', name: 'Project 3', type: 'Type 3', col1: 'Value 3-1', col2: 'Value 3-2', col3: 'Value 3-3' },
        { id: '4', name: 'Project 4', type: 'Type 4', col1: 'Value 4-1', col2: 'Value 4-2', col3: 'Value 4-3' },
        { id: '5', name: 'Project 5', type: 'Type 1', col1: 'Value 5-1', col2: 'Value 5-2', col3: 'Value 5-3' },
        { id: '6', name: 'Project 6', type: 'Type 2', col1: 'Value 6-1', col2: 'Value 6-2', col3: 'Value 6-3' },
        { id: '7', name: 'Project 7', type: 'Type 3', col1: 'Value 7-1', col2: 'Value 7-2', col3: 'Value 7-3' },
        { id: '8', name: 'Project 8', type: 'Type 4', col1: 'Value 8-1', col2: 'Value 8-2', col3: 'Value 8-3' },
        { id: '9', name: 'Project 9', type: 'Type 1', col1: 'Value 9-1', col2: 'Value 9-2', col3: 'Value 9-3' },
        { id: '10', name: 'Project 10', type: 'Type 2', col1: 'Value 10-1', col2: 'Value 10-2', col3: 'Value 10-3' },
      ];
    }
    
    // Convert the 2D array data to objects
    return tableData.map((row, i) => {
      const rowObj: Record<string, string> = {
        id: row[0] || `${i + 1}`,
        name: row[1] || `Project ${i + 1}`,
        type: row[2] || `Type ${i % 4 + 1}`,
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
      meta: { sticky: true, index: 0 } as ColumnMeta
    },
    { 
      accessorKey: 'name', 
      header: 'Name', 
      meta: { sticky: true, index: 1 } as ColumnMeta
    },
    { 
      accessorKey: 'type', 
      header: 'Type'
    },
    
    // Generate additional columns
    ...Array.from({ length: 17 }).map((_, i) => ({
      accessorKey: `col${i}`,
      header: `Column ${i + 1}`
    }))
  ], []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Function to calculate left position for each sticky column
  const getLeftPosition = (index: number): string | number | undefined => {
    if (index === 0) return 0;
    if (index === 1) return '80px'; // Width of first column
    return undefined;
  };

  // Get background color based on theme
  const getBgColor = (isEvenRow: boolean = false) => {
    if (isDarkMode) {
      return isEvenRow ? 'hsl(var(--muted)/20)' : 'hsl(var(--background))';
    } else {
      return isEvenRow ? 'hsl(var(--muted)/10)' : 'hsl(var(--background))';
    }
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      overflowX: 'auto',
      overflowY: 'auto',
      maxHeight: '70vh',
      border: '1px solid hsl(var(--border))',
      borderRadius: '0.5rem'
    }}>
      <Table style={{ 
        width: 'auto', 
        minWidth: '100%',
        borderCollapse: 'separate'
      }}>
        <TableHeader>
          <TableRow>
            {table.getFlatHeaders().map((header, index) => {
              const columnMeta = header.column.columnDef.meta as ColumnMeta | undefined;
              const isSticky = !!columnMeta?.sticky;
              const stickyIndex = columnMeta?.index || 0;
              const isIdCol = index === 0;
              
              return (
                <TableHead
                  key={header.id}
                  style={{
                    minWidth: isIdCol ? '80px' : '200px',
                    width: isIdCol ? '80px' : '200px',
                    position: isSticky ? 'sticky' : undefined,
                    left: isSticky ? getLeftPosition(stickyIndex) : undefined,
                    zIndex: isSticky ? 30 : undefined,
                    backgroundColor: getBgColor(),
                    boxShadow: isSticky ? '2px 0 5px -2px rgba(0,0,0,0.15)' : undefined
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
            
            return (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell, cellIndex) => {
                  const columnMeta = cell.column.columnDef.meta as ColumnMeta | undefined;
                  const isSticky = !!columnMeta?.sticky;
                  const stickyIndex = columnMeta?.index || 0;
                  const isIdCol = cellIndex === 0;
                  
                  return (
                    <TableCell
                      key={cell.id}
                      style={{
                        width: isIdCol ? '80px' : '200px',
                        minWidth: isIdCol ? '80px' : '200px',
                        position: isSticky ? 'sticky' : undefined,
                        left: isSticky ? getLeftPosition(stickyIndex) : undefined,
                        zIndex: isSticky ? 20 : undefined,
                        backgroundColor: getBgColor(isEvenRow),
                        boxShadow: isSticky ? '2px 0 5px -2px rgba(0,0,0,0.15)' : undefined
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
  );
}
