
import React, { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  ColumnDef,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from 'next-themes';
import './StickyTableStyles.css';

// Define data type
interface DataItem {
  id: number;
  col1: string;
  col2: string;
  col3: string;
  col4: string;
  col5: string;
  col6: string;
  col7: string;
  col8: string;
  col9: string;
  col10: string;
}

// Generate sample data
const generateData = (): DataItem[] => {
  return Array.from({ length: 30 }).map((_, i) => ({
    id: i + 1,
    col1: `A-${i + 101}`,
    col2: `Project ${i + 1}`,
    col3: `Value 3.${i + 1}`,
    col4: `Value 4.${i + 1}`,
    col5: `Value 5.${i + 1}`,
    col6: `Value 6.${i + 1}`,
    col7: `Value 7.${i + 1}`,
    col8: `Value 8.${i + 1}`,
    col9: `Value 9.${i + 1}`,
    col10: `Value 10.${i + 1}`,
  }));
};

const data = generateData();

// Column definitions with explicit pinning
const columns: ColumnDef<DataItem>[] = [
  {
    accessorKey: 'col1',
    header: 'Nr.',
    meta: { width: 100 },
    enablePinning: true,
  },
  {
    accessorKey: 'col2',
    header: 'Navn',
    meta: { width: 150 },
    enablePinning: true,
  },
  {
    accessorKey: 'col3',
    header: 'Column 3',
    meta: { width: 150 },
    enablePinning: true,
  },
  {
    accessorKey: 'col4',
    header: 'Column 4',
    meta: { width: 150 },
    enablePinning: true,
  },
  {
    accessorKey: 'col5',
    header: 'Column 5',
    meta: { width: 150 },
    enablePinning: true,
  },
  {
    accessorKey: 'col6',
    header: 'Column 6',
    meta: { width: 150 },
    enablePinning: true,
  },
  {
    accessorKey: 'col7',
    header: 'Column 7',
    meta: { width: 150 },
    enablePinning: true,
  },
  {
    accessorKey: 'col8',
    header: 'Column 8',
    meta: { width: 150 },
    enablePinning: true,
  },
  {
    accessorKey: 'col9',
    header: 'Column 9',
    meta: { width: 150 },
    enablePinning: true,
  },
  {
    accessorKey: 'col10',
    header: 'Column 10',
    meta: { width: 150 },
    enablePinning: true,
  },
];

export default function StickyTable() {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  
  // Define CSS variables for colors
  const headerBgColor = isDarkMode ? 'hsl(var(--muted))' : 'white';
  const subheaderBgColor = isDarkMode ? 'hsl(var(--muted)/50)' : '#f5f5f5';
  const rowBgColor = isDarkMode ? 'hsl(var(--background))' : 'white';
  
  // Initialize table with TanStack's useReactTable
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
      columnPinning: {
        left: ['col1', 'col2'],
        right: [],
      },
    },
    enableColumnPinning: true,
  });

  return (
    <div className="w-full space-y-4">
      <div className="rounded-md border overflow-hidden">
        {/* Define CSS variables for dynamic styling */}
        <div 
          className="sticky-table-container"
          style={
            {
              '--header-bg-color': headerBgColor,
              '--subheader-bg-color': subheaderBgColor,
            } as React.CSSProperties
          }
        >
          <Table className="sticky-table">
            <TableHeader>
              {/* First sticky header row */}
              <TableRow className="sticky-header">
                {table.getHeaderGroups()[0].headers.map((header) => {
                  // Handle pinned columns
                  const isPinned = header.column.getIsPinned();
                  const pinClass = isPinned === 'left' ? 'left-pinned' : (isPinned === 'right' ? 'right-pinned' : '');
                  const leftPos = isPinned === 'left' ? `${header.column.getStart('left')}px` : undefined;
                  const rightPos = isPinned === 'right' ? `${header.column.getAfter('right')}px` : undefined;
                  const width = (header.column.columnDef.meta as any)?.width || 150;
                  
                  return (
                    <TableHead
                      key={header.id}
                      className={pinClass}
                      style={{
                        width: `${width}px`,
                        minWidth: `${width}px`,
                        left: leftPos,
                        right: rightPos,
                        backgroundColor: headerBgColor,
                      }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
              
              {/* Second sticky header row */}
              <TableRow className="sticky-subheader">
                {table.getHeaderGroups()[0].headers.map((header) => {
                  // Handle pinned columns
                  const isPinned = header.column.getIsPinned();
                  const pinClass = isPinned === 'left' ? 'left-pinned' : (isPinned === 'right' ? 'right-pinned' : '');
                  const leftPos = isPinned === 'left' ? `${header.column.getStart('left')}px` : undefined;
                  const rightPos = isPinned === 'right' ? `${header.column.getAfter('right')}px` : undefined;
                  const width = (header.column.columnDef.meta as any)?.width || 150;
                  
                  return (
                    <TableHead
                      key={`subheader-${header.id}`}
                      className={pinClass}
                      style={{
                        width: `${width}px`,
                        minWidth: `${width}px`,
                        left: leftPos,
                        right: rightPos,
                        backgroundColor: subheaderBgColor,
                      }}
                    >
                      {`Sub ${table.getHeaderGroups()[0].headers.indexOf(header) + 1}`}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    // Handle pinned columns
                    const isPinned = cell.column.getIsPinned();
                    const pinClass = isPinned === 'left' ? 'left-pinned' : (isPinned === 'right' ? 'right-pinned' : '');
                    const leftPos = isPinned === 'left' ? `${cell.column.getStart('left')}px` : undefined;
                    const rightPos = isPinned === 'right' ? `${cell.column.getAfter('right')}px` : undefined;
                    const width = (cell.column.columnDef.meta as any)?.width || 150;
                    
                    return (
                      <TableCell
                        key={cell.id}
                        className={pinClass}
                        style={{
                          width: `${width}px`,
                          minWidth: `${width}px`,
                          left: leftPos,
                          right: rightPos,
                          backgroundColor: rowBgColor,
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
      
      {/* Pagination controls */}
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="ml-1">Previous</span>
        </Button>
        <div className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <span className="mr-1">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
