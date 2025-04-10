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
  groupIndex?: number;
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
    
    // Log first few rows to see actual data structure
    console.log("Sample table data structure (first 2 rows):", tableData.slice(0, 2));
    
    // Convert the 2D array data to objects
    return tableData.map((row, i) => {
      // Get the actual appointment number from the row (directly from API)
      const appointmentNumber = row[0]; // This is the actual appointment number
      console.log(`Row ${i}: appointment number = ${appointmentNumber}`);
      
      const rowObj: Record<string, string> = {
        id: appointmentNumber, // Use the actual appointment number as id
        name: row[1] || `Project ${i + 1}`, // Subject
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
  const getGroupBgColor = (groupIndex: number) => {
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
      height: '500px',
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
                          backgroundColor: getGroupBgColor(groupIndex),
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
