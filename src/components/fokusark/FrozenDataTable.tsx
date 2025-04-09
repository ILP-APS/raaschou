
import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
  SortingState,
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
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Define the data type for our table
type FokusarkRow = {
  id: number;
  nr: string;
  navn: string;
  ansvarlig: string;
  tilbud: string;
  montage: string;
  underleverandor: string;
  montage2: string;
  underleverandor2: string;
  materialer: string;
  projektering: string;
  produktion: string;
  montage3: string;
  projektering2: string;
  produktionRealized: string;
  montageRealized: string;
  total: string;
  timerTilbage1: string;
  timerTilbage2: string;
  faerdigPctExMontageNu: string;
  faerdigPctExMontageFoer: string;
  estTimerIftFaerdigPct: string;
  plusMinusTimer: string;
  afsatFragt: string;
  isSubAppointment: boolean;
};

// Generate sample data for the table
const generateSampleData = (): FokusarkRow[] => {
  const data: FokusarkRow[] = [];
  for (let i = 1; i <= 50; i++) {
    const row: FokusarkRow = {
      id: i,
      nr: `A-${100 + i}`,
      navn: `Project ${i}`,
      ansvarlig: `User ${i % 5 + 1}`,
      tilbud: (Math.random() * 100000).toFixed(2).replace('.', ','),
      montage: (Math.random() * 20000).toFixed(2).replace('.', ','),
      underleverandor: (Math.random() * 15000).toFixed(2).replace('.', ','),
      montage2: '0,00',
      underleverandor2: '0,00',
      materialer: (Math.random() * 30000).toFixed(2).replace('.', ','),
      projektering: (Math.random() * 15000).toFixed(2).replace('.', ','),
      produktion: (Math.random() * 25000).toFixed(2).replace('.', ','),
      montage3: (Math.random() * 10000).toFixed(2).replace('.', ','),
      projektering2: (Math.random() * 12000).toFixed(2).replace('.', ','),
      produktionRealized: (Math.random() * 20000).toFixed(2).replace('.', ','),
      montageRealized: (Math.random() * 8000).toFixed(2).replace('.', ','),
      total: (Math.random() * 150000).toFixed(2).replace('.', ','),
      timerTilbage1: (Math.random() * 100).toFixed(2).replace('.', ','),
      timerTilbage2: (Math.random() * 200).toFixed(2).replace('.', ','),
      faerdigPctExMontageNu: (Math.random() * 100).toFixed(2).replace('.', ','),
      faerdigPctExMontageFoer: (Math.random() * 100).toFixed(2).replace('.', ','),
      estTimerIftFaerdigPct: (Math.random() * 300).toFixed(2).replace('.', ','),
      plusMinusTimer: (Math.random() * 50 - 25).toFixed(2).replace('.', ','),
      afsatFragt: (Math.random() * 5000).toFixed(2).replace('.', ','),
      isSubAppointment: i % 3 === 0
    };
    data.push(row);
  }
  return data;
};

export default function FrozenDataTable() {
  const [data] = useState<FokusarkRow[]>(() => generateSampleData());
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});
  
  // Create a column helper based on our data type
  const columnHelper = createColumnHelper<FokusarkRow>();
  
  // Define columns with column helper
  const columns = React.useMemo<ColumnDef<FokusarkRow>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="ml-2"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="ml-2"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
      columnHelper.accessor('nr', {
        header: 'Nr.',
        cell: info => info.getValue(),
        size: 80,
      }),
      columnHelper.accessor('navn', {
        header: 'Navn',
        cell: info => info.getValue(),
        size: 250,
      }),
      columnHelper.accessor('ansvarlig', {
        header: 'Ansvarlig',
        cell: info => info.getValue(),
        size: 120,
      }),
      columnHelper.accessor('tilbud', {
        header: 'Tilbud',
        cell: info => (
          <div className="text-right font-mono">
            kr. {info.getValue()}
          </div>
        ),
        size: 120,
      }),
      {
        id: 'actions',
        cell: ({ row }) => {
          const appointment = row.original;
          
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => console.log(appointment)}>
                  View details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );
  
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });
  
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Style:</span>
            <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm">
              <option>New York</option>
              <option>London</option>
              <option>Paris</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="flex items-center py-4 gap-2">
        <Input
          placeholder="Filter emails..."
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(String(e.target.value))}
          className="max-w-sm"
        />
        
        <div className="ml-auto">
          <Button variant="outline" className="ml-2">
            Columns
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="bg-muted/30"
                  >
                    <div className="flex items-center justify-between">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <div className="pl-1">
                          {{
                            asc: <ChevronUp className="h-4 w-4" />,
                            desc: <ChevronDown className="h-4 w-4" />
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className={row.original.isSubAppointment ? 'bg-muted/20' : ''}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id}
                      className="py-3"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  table.previousPage();
                }}
                aria-disabled={!table.getCanPreviousPage()}
                className={!table.getCanPreviousPage() ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    table.setPageIndex(i);
                  }}
                  isActive={table.getState().pagination.pageIndex === i}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            {table.getPageCount() > 5 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  table.nextPage();
                }}
                aria-disabled={!table.getCanNextPage()}
                className={!table.getCanNextPage() ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
