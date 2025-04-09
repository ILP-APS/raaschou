
import React, { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
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
import { ArrowUpDown } from 'lucide-react';

// Sample data - replace with your own
const data = [
  { id: 1, col1: "A1", col2: "B1", col3: "C1", col4: "D1", col5: "E1" },
  { id: 2, col1: "A2", col2: "B2", col3: "C2", col4: "D2", col5: "E2" },
  { id: 3, col1: "A3", col2: "B3", col3: "C3", col4: "D3", col5: "E3" },
  { id: 4, col1: "A4", col2: "B4", col3: "C4", col4: "D4", col5: "E4" },
  { id: 5, col1: "A5", col2: "B5", col3: "C5", col4: "D5", col5: "E5" },
  { id: 6, col1: "A6", col2: "B6", col3: "C6", col4: "D6", col5: "E6" },
  { id: 7, col1: "A7", col2: "B7", col3: "C7", col4: "D7", col5: "E7" },
  { id: 8, col1: "A8", col2: "B8", col3: "C8", col4: "D8", col5: "E8" },
];

// Define columns
const columns = [
  {
    accessorKey: 'col1',
    header: ({ column }) => (
      <div className="flex items-center">
        Column 1
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    meta: { frozen: true },
  },
  {
    accessorKey: 'col2',
    header: 'Column 2',
    meta: { frozen: true },
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
];

export default function FrozenDataTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className="w-full">
      <div className="relative overflow-auto border rounded-md" style={{ maxHeight: '400px', maxWidth: '100%' }}>
        <Table>
          {/* Frozen Header Rows (Top 2) */}
          <TableHeader className="sticky top-0 z-20 bg-background">
            {/* First frozen header row */}
            <TableRow>
              {table.getHeaderGroups()[0].headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={header.column.columnDef.meta?.frozen ? 'sticky left-0 z-30 bg-background' : ''}
                  style={{ minWidth: '150px' }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
            {/* Second frozen header row (just for demonstration) */}
            <TableRow className="bg-muted/50">
              {table.getHeaderGroups()[0].headers.map((header) => (
                <TableHead
                  key={`subheader-${header.id}`}
                  className={header.column.columnDef.meta?.frozen ? 'sticky left-0 z-30 bg-muted/50' : ''}
                  style={{ minWidth: '150px' }}
                >
                  Sub-header {header.index + 1}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cell.column.columnDef.meta?.frozen ? 'sticky left-0 z-10 bg-background' : ''}
                    style={{ minWidth: '150px' }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
