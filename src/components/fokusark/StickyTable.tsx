
import React from 'react';
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

// Define your data type
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

export default function StickyTable() {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  
  // Define background colors based on theme
  const headerBgColor = isDarkMode ? 'hsl(var(--muted))' : 'white';
  const subheaderBgColor = isDarkMode ? 'hsl(var(--muted)/50)' : '#f5f5f5';
  const rowBgColor = isDarkMode ? 'hsl(var(--background))' : 'white';
  const borderColor = 'hsl(var(--border))';

  // Define columns
  const columns: ColumnDef<DataItem, any>[] = [
    {
      accessorKey: 'col1',
      header: 'Nr.',
      enablePinning: true,
    },
    {
      accessorKey: 'col2',
      header: 'Navn',
      enablePinning: true,
    },
    {
      accessorKey: 'col3',
      header: 'Column 3',
    },
    {
      accessorKey: 'col4',
      header: 'Column 4',
    },
    {
      accessorKey: 'col5',
      header: 'Column 5',
    },
    {
      accessorKey: 'col6',
      header: 'Column 6',
    },
    {
      accessorKey: 'col7',
      header: 'Column 7',
    },
    {
      accessorKey: 'col8',
      header: 'Column 8',
    },
    {
      accessorKey: 'col9',
      header: 'Column 9',
    },
    {
      accessorKey: 'col10',
      header: 'Column 10',
    },
  ];

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
        left: ['col1', 'col2'],  // Pin first two columns by default
        right: [],
      },
    },
    enableColumnPinning: true,
  });

  return (
    <div className="w-full space-y-4">
      <div className="rounded-md border overflow-hidden">
        {/* Table container with scrolling */}
        <div className="sticky-table-container">
          <Table className="sticky-table">
            <TableHeader>
              {/* First sticky header row */}
              <TableRow className="sticky-header" style={{ backgroundColor: headerBgColor }}>
                {table.getFlatHeaders().map((header) => {
                  const isPinned = header.column.getIsPinned();
                  const pinSide = isPinned === 'left' ? 'left' : (isPinned === 'right' ? 'right' : undefined);
                  const left = pinSide === 'left' ? `${header.column.getStart()}px` : undefined;
                  const right = pinSide === 'right' ? `${header.column.getAfter()}px` : undefined;
                  
                  return (
                    <TableHead
                      key={header.id}
                      className={isPinned ? `cell-pinned-${pinSide}` : ""}
                      style={{
                        width: '150px',
                        minWidth: '150px',
                        left: left,
                        right: right,
                        backgroundColor: headerBgColor,
                        boxShadow: isPinned ? `${pinSide === 'left' ? 1 : -1}px 0 0 0 ${borderColor}` : undefined,
                        zIndex: isPinned ? 40 : 30,
                      }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
              
              {/* Second sticky header row */}
              <TableRow className="sticky-subheader" style={{ backgroundColor: subheaderBgColor }}>
                {table.getFlatHeaders().map((header, index) => {
                  const isPinned = header.column.getIsPinned();
                  const pinSide = isPinned === 'left' ? 'left' : (isPinned === 'right' ? 'right' : undefined);
                  const left = pinSide === 'left' ? `${header.column.getStart()}px` : undefined;
                  const right = pinSide === 'right' ? `${header.column.getAfter()}px` : undefined;
                  
                  return (
                    <TableHead
                      key={`subheader-${header.id}`}
                      className={isPinned ? `cell-pinned-${pinSide}` : ""}
                      style={{
                        width: '150px',
                        minWidth: '150px',
                        left: left,
                        right: right,
                        backgroundColor: subheaderBgColor,
                        boxShadow: isPinned ? `${pinSide === 'left' ? 1 : -1}px 0 0 0 ${borderColor}` : undefined,
                        zIndex: isPinned ? 40 : 30,
                      }}
                    >
                      {`Sub ${index + 1}`}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {table.getRowModel().rows.map(row => (
                <TableRow key={row.id} style={{ backgroundColor: rowBgColor }}>
                  {row.getVisibleCells().map((cell) => {
                    const isPinned = cell.column.getIsPinned();
                    const pinSide = isPinned === 'left' ? 'left' : (isPinned === 'right' ? 'right' : undefined);
                    const left = pinSide === 'left' ? `${cell.column.getStart()}px` : undefined;
                    const right = pinSide === 'right' ? `${cell.column.getAfter()}px` : undefined;
                    
                    return (
                      <TableCell
                        key={cell.id}
                        className={isPinned ? `cell-pinned-${pinSide}` : ""}
                        style={{
                          width: '150px',
                          minWidth: '150px',
                          left: left,
                          right: right,
                          backgroundColor: rowBgColor,
                          boxShadow: isPinned ? `${pinSide === 'left' ? 1 : -1}px 0 0 0 ${borderColor}` : undefined,
                          zIndex: isPinned ? 20 : 10,
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
