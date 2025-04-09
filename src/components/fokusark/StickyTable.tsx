
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
import './StickyTableStyles.css'; // Keep this import for scrollbar styles only

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

// Define custom metadata for our columns
interface ColumnMeta {
  frozen?: boolean;
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

  // Define columns with first two frozen
  const columns: ColumnDef<DataItem, any>[] = [
    {
      accessorKey: 'col1',
      header: 'Nr.',
      meta: { frozen: true } as ColumnMeta,
    },
    {
      accessorKey: 'col2',
      header: 'Navn',
      meta: { frozen: true } as ColumnMeta,
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
    },
  });

  // Helper function to calculate left offset for frozen columns
  const getColumnOffset = (index: number): number => {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      if ((table.getFlatHeaders()[i].column.columnDef.meta as ColumnMeta)?.frozen) {
        offset += 150; // Fixed column width
      }
    }
    return offset;
  };

  return (
    <div className="w-full space-y-4">
      <div className="rounded-md border overflow-hidden">
        {/* Table container with scrolling */}
        <div 
          className="sticky-table-container"
          style={{ 
            maxHeight: '500px',
            maxWidth: '100%',
            overflow: 'auto',
            position: 'relative' // Ensure position context for sticky elements
          }}
        >
          <Table style={{ width: 'auto', minWidth: '100%' }}>
            <TableHeader>
              {/* First sticky header row */}
              <TableRow
                style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 30,
                  backgroundColor: headerBgColor,
                  boxShadow: `0 1px 0 0 ${borderColor}`,
                }}
              >
                {table.getFlatHeaders().map((header, index) => {
                  const isFrozen = !!(header.column.columnDef.meta as ColumnMeta)?.frozen;
                  const leftOffset = isFrozen ? getColumnOffset(index) : undefined;
                  
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        width: '150px',
                        minWidth: '150px',
                        position: isFrozen ? 'sticky' : 'static',
                        left: isFrozen ? `${leftOffset}px` : undefined,
                        zIndex: isFrozen ? 40 : 30,
                        backgroundColor: headerBgColor,
                        boxShadow: isFrozen ? `1px 0 0 0 ${borderColor}` : undefined,
                      }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
              
              {/* Second sticky header row */}
              <TableRow
                style={{
                  position: 'sticky',
                  top: '41px', // Adjust based on your first row height
                  zIndex: 30,
                  backgroundColor: subheaderBgColor,
                  boxShadow: `0 1px 0 0 ${borderColor}`,
                }}
              >
                {table.getFlatHeaders().map((header, index) => {
                  const isFrozen = !!(header.column.columnDef.meta as ColumnMeta)?.frozen;
                  const leftOffset = isFrozen ? getColumnOffset(index) : undefined;
                  
                  return (
                    <TableHead
                      key={`subheader-${header.id}`}
                      style={{
                        width: '150px',
                        minWidth: '150px',
                        position: isFrozen ? 'sticky' : 'static',
                        left: isFrozen ? `${leftOffset}px` : undefined,
                        zIndex: isFrozen ? 40 : 30,
                        backgroundColor: subheaderBgColor,
                        boxShadow: isFrozen ? `1px 0 0 0 ${borderColor}` : undefined,
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
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell, index) => {
                    const isFrozen = !!(cell.column.columnDef.meta as ColumnMeta)?.frozen;
                    const leftOffset = isFrozen ? getColumnOffset(index) : undefined;
                    
                    return (
                      <TableCell
                        key={cell.id}
                        style={{
                          width: '150px',
                          minWidth: '150px',
                          position: isFrozen ? 'sticky' : 'static',
                          left: isFrozen ? `${leftOffset}px` : undefined,
                          zIndex: isFrozen ? 20 : 10,
                          backgroundColor: rowBgColor,
                          boxShadow: isFrozen ? `1px 0 0 0 ${borderColor}` : undefined,
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
