
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
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { ChevronDown, ChevronUp } from 'lucide-react';

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

// Create a column helper based on our data type
const columnHelper = createColumnHelper<FokusarkRow>();

export default function FrozenDataTable() {
  const [data] = useState<FokusarkRow[]>(() => generateSampleData());
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  
  // Define columns with column helper
  const columns = React.useMemo<ColumnDef<FokusarkRow>[]>(
    () => [
      columnHelper.accessor('nr', {
        header: 'Nr.',
        cell: info => info.getValue(),
        meta: {
          className: 'sticky left-0 bg-background z-10 min-w-[100px]',
          headerClassName: 'sticky left-0 bg-muted z-20'
        },
      }),
      columnHelper.accessor('navn', {
        header: 'Navn',
        cell: info => info.getValue(),
        meta: {
          className: 'sticky left-[100px] bg-background z-10 min-w-[250px]',
          headerClassName: 'sticky left-[100px] bg-muted z-20'
        },
      }),
      columnHelper.accessor('ansvarlig', {
        header: 'Ansvarlig',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('tilbud', {
        header: 'Tilbud',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('montage', {
        header: 'Montage',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('underleverandor', {
        header: 'Underleverandør',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('montage2', {
        header: 'Montage 2',
        cell: info => (
          <Input 
            value={info.getValue()} 
            onChange={e => console.log('Changing montage2:', e.target.value)}
            className="h-8 w-full border-0 bg-transparent focus:ring-1 focus:ring-primary"
          />
        ),
      }),
      columnHelper.accessor('underleverandor2', {
        header: 'Underleverandør 2',
        cell: info => (
          <Input 
            value={info.getValue()} 
            onChange={e => console.log('Changing underleverandor2:', e.target.value)}
            className="h-8 w-full border-0 bg-transparent focus:ring-1 focus:ring-primary"
          />
        ),
      }),
      columnHelper.accessor('materialer', {
        header: 'Materialer',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('projektering', {
        header: 'Projektering',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('produktion', {
        header: 'Produktion',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('montage3', {
        header: 'Montage',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('projektering2', {
        header: 'Projektering',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('produktionRealized', {
        header: 'Produktion',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('montageRealized', {
        header: 'Montage',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('total', {
        header: 'Total',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('timerTilbage1', {
        header: 'Timer tilbage',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('timerTilbage2', {
        header: 'Timer tilbage',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('faerdigPctExMontageNu', {
        header: 'Færdig % ex montage nu',
        cell: info => (
          <Input 
            value={info.getValue()} 
            onChange={e => console.log('Changing faerdigPctExMontageNu:', e.target.value)}
            className="h-8 w-full border-0 bg-transparent focus:ring-1 focus:ring-primary"
          />
        ),
      }),
      columnHelper.accessor('faerdigPctExMontageFoer', {
        header: 'Færdig % ex montage før',
        cell: info => (
          <Input 
            value={info.getValue()} 
            onChange={e => console.log('Changing faerdigPctExMontageFoer:', e.target.value)}
            className="h-8 w-full border-0 bg-transparent focus:ring-1 focus:ring-primary"
          />
        ),
      }),
      columnHelper.accessor('estTimerIftFaerdigPct', {
        header: 'Est timer ift færdig %',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('plusMinusTimer', {
        header: '+/- timer',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('afsatFragt', {
        header: 'Afsat fragt',
        cell: info => info.getValue(),
      })
    ],
    []
  );
  
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });
  
  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-2">
        <Input
          placeholder="Search projects..."
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(String(e.target.value))}
          className="max-w-sm"
        />
      </div>
      
      <div className="border rounded-md relative overflow-auto" style={{ maxHeight: '500px' }}>
        <style jsx>{`
          .sticky {
            position: sticky;
            z-index: 10;
          }
          
          .left-0 {
            left: 0;
          }
          
          .left-\\[100px\\] {
            left: 100px;
          }
          
          .bg-background {
            background-color: hsl(var(--background));
          }
          
          .bg-muted {
            background-color: hsl(var(--muted));
          }
        `}</style>
        
        <Table>
          <TableHeader className="sticky top-0 bg-muted z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    className={(header.column.columnDef.meta as any)?.headerClassName}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
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
                  className={row.original.isSubAppointment ? 'bg-muted/20' : ''}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id}
                      className={(cell.column.columnDef.meta as any)?.className}
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
          Showing page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
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
            
            {table.getPageCount() > 5 && <PaginationEllipsis />}
            
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
