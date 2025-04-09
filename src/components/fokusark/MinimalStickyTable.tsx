
import React from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
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

// Sample data
const data = [
  { id: '1', name: 'Project 1', col1: 'Bud-1-1', col2: 'Bud-1-2', col3: 'Bud-1-3' },
  { id: '2', name: 'Project 2', col1: 'Bud-2-1', col2: 'Bud-2-2', col3: 'Bud-2-3' },
  { id: '3', name: 'Project 3', col1: 'Bud-3-1', col2: 'Bud-3-2', col3: 'Bud-3-3' },
  { id: '4', name: 'Project 4', col1: 'Bud-4-1', col2: 'Bud-4-2', col3: 'Bud-4-3' },
  { id: '5', name: 'Project 5', col1: 'Bud-5-1', col2: 'Bud-5-2', col3: 'Bud-5-3' },
];

const columns = [
  {
    accessorKey: 'id',
    header: 'ID',
    meta: { sticky: true, index: 0 }
  },
  {
    accessorKey: 'name',
    header: 'Name',
    meta: { sticky: true, index: 1 }
  },
  {
    accessorKey: 'col1',
    header: 'Budget 1'
  },
  {
    accessorKey: 'col2',
    header: 'Budget 2'
  },
  {
    accessorKey: 'col3',
    header: 'Budget 3'
  },
  // Add more columns to force horizontal scrolling
  {
    accessorKey: 'col1',
    header: 'Budget 4',
    id: 'col4'
  },
  {
    accessorKey: 'col2',
    header: 'Budget 5',
    id: 'col5'
  },
  {
    accessorKey: 'col3',
    header: 'Budget 6',
    id: 'col6'
  },
  {
    accessorKey: 'col1',
    header: 'Budget 7',
    id: 'col7'
  },
  {
    accessorKey: 'col2',
    header: 'Budget 8',
    id: 'col8'
  }
];

export default function MinimalStickyTable() {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Function to calculate left position for each sticky column
  const getLeftPosition = (index: number) => {
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
              const isSticky = !!(header.column.columnDef.meta as any)?.sticky;
              const stickyIndex = (header.column.columnDef.meta as any)?.index || 0;
              
              return (
                <TableHead
                  key={header.id}
                  style={{
                    width: index === 0 ? '80px' : '200px',
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
                  const isSticky = !!(cell.column.columnDef.meta as any)?.sticky;
                  const stickyIndex = (cell.column.columnDef.meta as any)?.index || 0;
                  
                  return (
                    <TableCell
                      key={cell.id}
                      style={{
                        width: cellIndex === 0 ? '80px' : '200px',
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
