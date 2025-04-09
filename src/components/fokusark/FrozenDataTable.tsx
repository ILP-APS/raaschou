import React, { useState, useEffect, useRef } from 'react';
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, createColumnHelper, flexRender, SortingState, ColumnDef } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { tableContainerStyles } from '@/components/FokusarkTableStyles';

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
  isSubAppointment: boolean;
};

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
  const [addShadow, setAddShadow] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const frozenColumnsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = tableContainerStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      setAddShadow(scrollLeft > 0);
    }
  };
  
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const columnHelper = createColumnHelper<FokusarkRow>();

  const frozenColumns = [
    {
      id: 'select',
      header: ({ table }) => (
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
        />
      ),
      cell: ({ row }) => (
        <Checkbox 
          checked={row.getIsSelected()} 
          onCheckedChange={value => row.toggleSelected(!!value)} 
          aria-label="Select row" 
        />
      ),
      enableSorting: false,
      enableHiding: false
    },
    columnHelper.accessor('nr', {
      header: 'Nr.',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('navn', {
      header: 'Navn',
      cell: info => info.getValue(),
    })
  ];

  const scrollableColumns = [
    columnHelper.accessor('ansvarlig', {
      header: 'Ansvarlig',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('tilbud', {
      header: 'Tilbud',
      cell: info => <div className="text-right font-mono">
              kr. {info.getValue()}
            </div>,
    }),
    columnHelper.accessor('montage', {
      header: 'Montage',
      cell: info => <div className="text-right font-mono">
              kr. {info.getValue()}
            </div>,
    }),
    columnHelper.accessor('underleverandor', {
      header: 'Underleverandør',
      cell: info => <div className="text-right font-mono">
              kr. {info.getValue()}
            </div>,
    }),
    columnHelper.accessor('materialer', {
      header: 'Materialer',
      cell: info => <div className="text-right font-mono">
              kr. {info.getValue()}
            </div>,
    }),
    columnHelper.accessor('projektering', {
      header: 'Projektering',
      cell: info => <div className="text-right font-mono">
              kr. {info.getValue()}
            </div>,
    }),
    columnHelper.accessor('col1', {
      header: 'Column 1',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('col2', {
      header: 'Column 2',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('col3', {
      header: 'Column 3',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('col4', {
      header: 'Column 4',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('col5', {
      header: 'Column 5',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('col6', {
      header: 'Column 6',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('col7', {
      header: 'Column 7',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('col8', {
      header: 'Column 8',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('col9', {
      header: 'Column 9',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('col10', {
      header: 'Column 10',
      cell: info => info.getValue(),
    }),
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
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
    }
  ];

  const frozenTable = useReactTable({
    data,
    columns: frozenColumns as any,
    state: {
      sorting,
      rowSelection
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  });

  const scrollableTable = useReactTable({
    data,
    columns: scrollableColumns as any,
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

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Optional search input could go here */}
        </div>
      </div>
      
      <div className="fokusark-table-scroll-container" ref={scrollContainerRef}>
        <div className="fokusark-table-wrapper">
          <div ref={frozenColumnsRef} className={`frozen-columns ${addShadow ? 'with-shadow' : ''}`}>
            <Table className="frozen-table">
              <TableHeader>
                {frozenTable.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableHead 
                        key={header.id} 
                        onClick={header.column.getToggleSortingHandler()} 
                        className={`bg-muted/30 ${header.id === 'select' ? 'col-0' : header.id === 'nr' ? 'col-0' : 'col-1'}`}
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
                {frozenTable.getRowModel().rows.map((row, index) => (
                  <TableRow 
                    key={row.id} 
                    data-state={row.getIsSelected() ? "selected" : undefined} 
                    className={`
                      ${row.original.isSubAppointment ? 'bg-muted/20' : ''}
                      ${index === 0 ? 'sticky-first-row' : ''}
                    `}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell 
                        key={cell.id} 
                        className={`py-3 ${cell.column.id === 'select' ? 'col-0' : cell.column.id === 'nr' ? 'col-0' : 'col-1'}`}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <Table className="fokusark-table">
            <TableHeader>
              {scrollableTable.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead 
                      key={header.id} 
                      onClick={header.column.getToggleSortingHandler()} 
                      className="bg-muted/30 col-scrollable"
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
              {scrollableTable.getRowModel().rows.map((row, index) => (
                <TableRow 
                  key={row.id} 
                  data-state={row.getIsSelected() ? "selected" : undefined} 
                  className={`
                    ${row.original.isSubAppointment ? 'bg-muted/20' : ''}
                    ${index === 0 ? 'sticky-first-row' : ''}
                  `}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell 
                      key={cell.id} 
                      className="py-3 col-scrollable"
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
      
      <div className="flex items-center justify-between py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {rowSelection && Object.keys(rowSelection).length > 0
            ? `${Object.keys(rowSelection).length} of ${data.length} row(s) selected.`
            : `${data.length} row(s) total.`}
        </div>
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  scrollableTable.previousPage();
                }}
                aria-disabled={!scrollableTable.getCanPreviousPage()}
              />
            </PaginationItem>
            {Array.from({length: scrollableTable.getPageCount()}, (_, i) => i + 1)
              .filter(page => 
                page <= 3 || 
                page > scrollableTable.getPageCount() - 3 || 
                Math.abs(page - scrollableTable.getState().pagination.pageIndex - 1) <= 1
              )
              .map((page, index, array) => {
                if (index > 0 && array[index - 1] !== page - 1) {
                  return [
                    <PaginationItem key={`ellipsis-${page}`}>
                      <PaginationEllipsis />
                    </PaginationItem>,
                    <PaginationItem key={page}>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          scrollableTable.setPageIndex(page - 1);
                        }}
                        isActive={scrollableTable.getState().pagination.pageIndex === page - 1}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ]
                } else {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          scrollableTable.setPageIndex(page - 1);
                        }}
                        isActive={scrollableTable.getState().pagination.pageIndex === page - 1}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                }
              })}
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  scrollableTable.nextPage();
                }}
                aria-disabled={!scrollableTable.getCanNextPage()}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
