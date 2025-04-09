
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

// Define data type with more columns
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
  col11: string;
  col12: string;
  col13: string;
  col14: string;
  col15: string;
}

// Generate sample data with more columns
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
    col11: `Value 11.${i + 1}`,
    col12: `Value 12.${i + 1}`,
    col13: `Value 13.${i + 1}`,
    col14: `Value 14.${i + 1}`,
    col15: `Value 15.${i + 1}`,
  }));
};

const data = generateData();

export default function StickyTable() {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  
  // Define CSS variables for colors
  const headerBgColor = isDarkMode ? 'hsl(var(--muted))' : 'white';
  const subheaderBgColor = isDarkMode ? 'hsl(var(--muted)/50)' : '#f5f5f5';
  const rowBgColor = isDarkMode ? 'hsl(var(--background))' : 'white';
  
  // Column definitions with pinning - now with more columns
  const columns: ColumnDef<DataItem>[] = [
    {
      accessorKey: 'col1',
      header: 'Nr.',
      size: 100,
      enablePinning: true,
    },
    {
      accessorKey: 'col2',
      header: 'Navn',
      size: 150,
      enablePinning: true,
    },
    {
      accessorKey: 'col3',
      header: 'Column 3',
      size: 150,
      enablePinning: true,
    },
    {
      accessorKey: 'col4',
      header: 'Column 4',
      size: 150,
      enablePinning: true,
    },
    {
      accessorKey: 'col5',
      header: 'Column 5',
      size: 150,
      enablePinning: true,
    },
    {
      accessorKey: 'col6',
      header: 'Column 6',
      size: 150,
      enablePinning: true,
    },
    {
      accessorKey: 'col7',
      header: 'Column 7',
      size: 150,
      enablePinning: true,
    },
    {
      accessorKey: 'col8',
      header: 'Column 8',
      size: 150,
      enablePinning: true,
    },
    {
      accessorKey: 'col9',
      header: 'Column 9',
      size: 150,
      enablePinning: true,
    },
    {
      accessorKey: 'col10',
      header: 'Column 10',
      size: 150,
      enablePinning: true,
    },
    {
      accessorKey: 'col11',
      header: 'Column 11',
      size: 150,
      enablePinning: true,
    },
    {
      accessorKey: 'col12',
      header: 'Column 12',
      size: 150,
      enablePinning: true,
    },
    {
      accessorKey: 'col13',
      header: 'Column 13',
      size: 150,
      enablePinning: true,
    },
    {
      accessorKey: 'col14',
      header: 'Column 14',
      size: 150,
      enablePinning: true,
    },
    {
      accessorKey: 'col15',
      header: 'Column 15',
      size: 150,
      enablePinning: true,
    },
  ];

  // Initialize table with column pinning
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
        left: ['col1', 'col2'], // Pin first and second columns to the left
        right: ['col15'], // Pin the last column to the right
      }
    },
    // This is needed to maintain the columnPinning state
    state: {
      columnPinning: {
        left: ['col1', 'col2'], // Pin first and second columns to the left
        right: ['col15'], // Pin the last column to the right
      }
    },
  });

  return (
    <div className="w-full space-y-4">
      <div className="rounded-md border overflow-hidden">
        <div 
          className="sticky-table-container"
          style={{
            '--header-bg-color': headerBgColor,
            '--subheader-bg-color': subheaderBgColor,
          } as React.CSSProperties}
        >
          <Table className="sticky-table">
            <TableHeader>
              {/* Header row */}
              <TableRow>
                {table.getLeftHeaderGroups()[0].headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{
                      width: `${header.getSize()}px`,
                      backgroundColor: headerBgColor,
                      position: 'sticky',
                      left: `${header.getStart('left')}px`,
                      zIndex: 3,
                    }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
                
                {table.getCenterHeaderGroups()[0].headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{
                      width: `${header.getSize()}px`,
                      backgroundColor: headerBgColor,
                    }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
                
                {table.getRightHeaderGroups()[0].headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{
                      width: `${header.getSize()}px`,
                      backgroundColor: headerBgColor,
                      position: 'sticky',
                      right: `${header.getStart('right')}px`,
                      zIndex: 3,
                    }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
              
              {/* Subheader row */}
              <TableRow>
                {table.getLeftHeaderGroups()[0].headers.map((header, index) => (
                  <TableHead
                    key={`subheader-left-${header.id}`}
                    style={{
                      width: `${header.getSize()}px`,
                      backgroundColor: subheaderBgColor,
                      position: 'sticky',
                      left: `${header.getStart('left')}px`,
                      zIndex: 3,
                    }}
                  >
                    {`Sub ${index + 1}`}
                  </TableHead>
                ))}
                
                {table.getCenterHeaderGroups()[0].headers.map((header, index) => (
                  <TableHead
                    key={`subheader-center-${header.id}`}
                    style={{
                      width: `${header.getSize()}px`,
                      backgroundColor: subheaderBgColor,
                    }}
                  >
                    {`Sub ${index + table.getLeftHeaderGroups()[0].headers.length + 1}`}
                  </TableHead>
                ))}
                
                {table.getRightHeaderGroups()[0].headers.map((header, index) => (
                  <TableHead
                    key={`subheader-right-${header.id}`}
                    style={{
                      width: `${header.getSize()}px`,
                      backgroundColor: subheaderBgColor,
                      position: 'sticky',
                      right: `${header.getStart('right')}px`,
                      zIndex: 3,
                    }}
                  >
                    {`Sub ${index + table.getLeftHeaderGroups()[0].headers.length + table.getCenterHeaderGroups()[0].headers.length + 1}`}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getLeftVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        width: `${cell.column.getSize()}px`,
                        backgroundColor: rowBgColor,
                        position: 'sticky',
                        left: `${cell.column.getStart('left')}px`,
                        zIndex: 1,
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                  
                  {row.getCenterVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        width: `${cell.column.getSize()}px`,
                        backgroundColor: rowBgColor,
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                  
                  {row.getRightVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        width: `${cell.column.getSize()}px`,
                        backgroundColor: rowBgColor,
                        position: 'sticky',
                        right: `${cell.column.getStart('right')}px`,
                        zIndex: 1,
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
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
