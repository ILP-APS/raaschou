import React, { useState } from 'react';
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, createColumnHelper, flexRender, SortingState, ColumnDef } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
  col1: string; // Additional columns
  col2: string;
  col3: string;
  col4: string;
  col5: string;
  col6: string;
  col7: string;
  col8: string;
  col9: string;
  col10: string;
  isSubAppointment: boolean;
};

// Generate sample data for the table
const generateSampleData = (): FokusarkRow[] => {
  const data: FokusarkRow[] = [];
  for (let i = 1; i <= 60; i++) {
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
      col1: `Value ${(Math.random() * 1000).toFixed(0)}`,
      col2: `Value ${(Math.random() * 1000).toFixed(0)}`,
      col3: `Value ${(Math.random() * 1000).toFixed(0)}`,
      col4: `Value ${(Math.random() * 1000).toFixed(0)}`,
      col5: `Value ${(Math.random() * 1000).toFixed(0)}`,
      col6: `Value ${(Math.random() * 1000).toFixed(0)}`,
      col7: `Value ${(Math.random() * 1000).toFixed(0)}`,
      col8: `Value ${(Math.random() * 1000).toFixed(0)}`,
      col9: `Value ${(Math.random() * 1000).toFixed(0)}`,
      col10: `Value ${(Math.random() * 1000).toFixed(0)}`,
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
  const columns = React.useMemo<ColumnDef<FokusarkRow>[]>(() => [{
    id: 'select',
    header: ({
      table
    }) => (
      <Checkbox 
        checked={
          table.getIsAllPageRowsSelected() 
            ? true 
            : table.getIsSomePageRowsSelected() 
              ? "indeterminate" 
              : false
        } 
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)} 
        aria-label="Select all" 
        className="ml-2" 
      />
    ),
    cell: ({
      row
    }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={value => row.toggleSelected(!!value)} aria-label="Select row" className="ml-2" />,
    enableSorting: false,
    enableHiding: false,
    size: 40
  }, columnHelper.accessor('nr', {
    header: 'Nr.',
    cell: info => info.getValue(),
    size: 80
  }), columnHelper.accessor('navn', {
    header: 'Navn',
    cell: info => info.getValue(),
    size: 250
  }), columnHelper.accessor('ansvarlig', {
    header: 'Ansvarlig',
    cell: info => info.getValue(),
    size: 120
  }), columnHelper.accessor('tilbud', {
    header: 'Tilbud',
    cell: info => <div className="text-right font-mono">
            kr. {info.getValue()}
          </div>,
    size: 120
  }), columnHelper.accessor('montage', {
    header: 'Montage',
    cell: info => <div className="text-right font-mono">
            kr. {info.getValue()}
          </div>,
    size: 120
  }), columnHelper.accessor('underleverandor', {
    header: 'Underleverandør',
    cell: info => <div className="text-right font-mono">
            kr. {info.getValue()}
          </div>,
    size: 150
  }), columnHelper.accessor('materialer', {
    header: 'Materialer',
    cell: info => <div className="text-right font-mono">
            kr. {info.getValue()}
          </div>,
    size: 120
  }), columnHelper.accessor('projektering', {
    header: 'Projektering',
    cell: info => <div className="text-right font-mono">
            kr. {info.getValue()}
          </div>,
    size: 120
  }), columnHelper.accessor('col1', {
    header: 'Column 1',
    cell: info => info.getValue(),
    size: 120
  }), columnHelper.accessor('col2', {
    header: 'Column 2',
    cell: info => info.getValue(),
    size: 120
  }), columnHelper.accessor('col3', {
    header: 'Column 3',
    cell: info => info.getValue(),
    size: 120
  }), columnHelper.accessor('col4', {
    header: 'Column 4',
    cell: info => info.getValue(),
    size: 120
  }), columnHelper.accessor('col5', {
    header: 'Column 5',
    cell: info => info.getValue(),
    size: 120
  }), columnHelper.accessor('col6', {
    header: 'Column 6',
    cell: info => info.getValue(),
    size: 120
  }), columnHelper.accessor('col7', {
    header: 'Column 7',
    cell: info => info.getValue(),
    size: 120
  }), columnHelper.accessor('col8', {
    header: 'Column 8',
    cell: info => info.getValue(),
    size: 120
  }), columnHelper.accessor('col9', {
    header: 'Column 9',
    cell: info => info.getValue(),
    size: 120
  }), columnHelper.accessor('col10', {
    header: 'Column 10',
    cell: info => info.getValue(),
    size: 120
  }), {
    id: 'actions',
    cell: ({
      row
    }) => {
      const appointment = row.original;
      return <DropdownMenu>
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
            </DropdownMenu>;
    }
  }], []);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      rowSelection
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
        pageSize: 10
      }
    }
  });

  return <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          
        </div>
      </div>
      
      
      
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => <TableHead key={header.id} onClick={header.column.getToggleSortingHandler()} className="bg-muted/30" style={{
                width: header.getSize() !== 0 ? header.getSize() : undefined
              }}>
                      <div className="flex items-center justify-between">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && <div className="pl-1">
                            {{
                      asc: <ChevronUp className="h-4 w-4" />,
                      desc: <ChevronDown className="h-4 w-4" />
                    }[header.column.getIsSorted() as string] ?? null}
                          </div>}
                      </div>
                    </TableHead>)}
                </TableRow>)}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? table.getRowModel().rows.map(row => <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined} className={row.original.isSubAppointment ? 'bg-muted/20' : ''}>
                    {row.getVisibleCells().map(cell => <TableCell key={cell.id} className="py-3" style={{
                width: cell.column.getSize() !== 0 ? cell.column.getSize() : undefined
              }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>)}
                  </TableRow>) : <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <div className="flex items-center justify-between py-4">
        
        
        
      </div>
    </div>;
}
