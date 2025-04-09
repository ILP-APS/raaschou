
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

// Sample data with more columns
const data = [
  { 
    id: '1', 
    name: 'Project 1', 
    col1: 'Bud-1-1', 
    col2: 'Bud-1-2', 
    col3: 'Bud-1-3',
    col4: 'Bud-1-4',
    col5: 'Bud-1-5',
    col6: 'Bud-1-6',
    col7: 'Bud-1-7',
    col8: 'Bud-1-8',
    col9: 'Bud-1-9',
    col10: 'Bud-1-10',
    col11: 'Bud-1-11',
    col12: 'Bud-1-12'
  },
  { 
    id: '2', 
    name: 'Project 2', 
    col1: 'Bud-2-1', 
    col2: 'Bud-2-2', 
    col3: 'Bud-2-3',
    col4: 'Bud-2-4',
    col5: 'Bud-2-5',
    col6: 'Bud-2-6',
    col7: 'Bud-2-7',
    col8: 'Bud-2-8',
    col9: 'Bud-2-9',
    col10: 'Bud-2-10',
    col11: 'Bud-2-11',
    col12: 'Bud-2-12'
  },
  { 
    id: '3', 
    name: 'Project 3', 
    col1: 'Bud-3-1', 
    col2: 'Bud-3-2', 
    col3: 'Bud-3-3',
    col4: 'Bud-3-4',
    col5: 'Bud-3-5',
    col6: 'Bud-3-6',
    col7: 'Bud-3-7',
    col8: 'Bud-3-8',
    col9: 'Bud-3-9',
    col10: 'Bud-3-10',
    col11: 'Bud-3-11',
    col12: 'Bud-3-12'
  },
  { 
    id: '4', 
    name: 'Project 4', 
    col1: 'Bud-4-1', 
    col2: 'Bud-4-2', 
    col3: 'Bud-4-3',
    col4: 'Bud-4-4',
    col5: 'Bud-4-5',
    col6: 'Bud-4-6',
    col7: 'Bud-4-7',
    col8: 'Bud-4-8',
    col9: 'Bud-4-9',
    col10: 'Bud-4-10',
    col11: 'Bud-4-11',
    col12: 'Bud-4-12'
  },
  { 
    id: '5', 
    name: 'Project 5', 
    col1: 'Bud-5-1', 
    col2: 'Bud-5-2', 
    col3: 'Bud-5-3',
    col4: 'Bud-5-4',
    col5: 'Bud-5-5',
    col6: 'Bud-5-6',
    col7: 'Bud-5-7',
    col8: 'Bud-5-8',
    col9: 'Bud-5-9',
    col10: 'Bud-5-10',
    col11: 'Bud-5-11',
    col12: 'Bud-5-12'
  },
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
  {
    accessorKey: 'col4',
    header: 'Budget 4'
  },
  {
    accessorKey: 'col5',
    header: 'Budget 5'
  },
  {
    accessorKey: 'col6',
    header: 'Budget 6'
  },
  {
    accessorKey: 'col7',
    header: 'Budget 7'
  },
  {
    accessorKey: 'col8',
    header: 'Budget 8'
  },
  {
    accessorKey: 'col9',
    header: 'Budget 9'
  },
  {
    accessorKey: 'col10',
    header: 'Budget 10'
  },
  {
    accessorKey: 'col11',
    header: 'Budget 11'
  },
  {
    accessorKey: 'col12',
    header: 'Budget 12'
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
      maxWidth: '800px', // Restrict container width to force scrolling
      overflowX: 'auto',
      overflowY: 'auto',
      maxHeight: '70vh',
      border: '1px solid hsl(var(--border))',
      borderRadius: '0.5rem'
    }}>
      <Table style={{ 
        width: 'auto', 
        minWidth: '1500px', // Force table to be wider than container
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
                    width: index === 0 ? '80px' : '150px',
                    minWidth: index === 0 ? '80px' : '150px',
                    position: 'sticky', // Make all header cells sticky vertically
                    top: 0, // Stick to the top
                    left: isSticky ? getLeftPosition(stickyIndex) : undefined, // Keep horizontal stickiness
                    zIndex: isSticky ? 50 : 40, // Higher z-index for headers, even higher for sticky columns
                    backgroundColor: getBgColor(),
                    boxShadow: isSticky 
                      ? '2px 2px 5px -2px rgba(0,0,0,0.15)' // Shadow for corner cells
                      : '0 2px 5px -2px rgba(0,0,0,0.15)' // Bottom shadow for regular header cells
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
                        width: cellIndex === 0 ? '80px' : '150px',
                        minWidth: cellIndex === 0 ? '80px' : '150px',
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
