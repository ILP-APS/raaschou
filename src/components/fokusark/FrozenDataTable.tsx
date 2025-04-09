
import React, { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  ColumnDef,
  ColumnFiltersState,
  getFilteredRowModel,
  VisibilityState,
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
import { ArrowUpDown, Settings2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

// Define the data type for our rows
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
  col16: string;
  col17: string;
  col18: string;
  col19: string;
  col20: string;
  col21: string;
  col22: string;
  col23: string;
  col24: string;
  col25: string;
}

// Define custom metadata for our columns
interface ColumnMeta {
  frozen?: boolean;
}

// Generate sample data with 25 columns
const generateSampleData = () => {
  const data: DataItem[] = [];
  for (let i = 1; i <= 50; i++) {
    const row: any = { id: i };
    for (let j = 1; j <= 25; j++) {
      row[`col${j}`] = `R${i}C${j}`;
    }
    data.push(row as DataItem);
  }
  return data;
};

const data: DataItem[] = generateSampleData();

// Create columns definition
const createColumns = (): ColumnDef<DataItem, keyof DataItem>[] => {
  const columns: ColumnDef<DataItem, keyof DataItem>[] = [];

  // First two columns are frozen
  columns.push({
    accessorKey: 'col1',
    header: ({ column }) => (
      <div className="flex items-center">
        Column 1
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    meta: { frozen: true } as ColumnMeta,
  });

  columns.push({
    accessorKey: 'col2',
    header: 'Column 2',
    meta: { frozen: true } as ColumnMeta,
  });

  // Generate other columns
  for (let i = 3; i <= 25; i++) {
    columns.push({
      accessorKey: `col${i}` as keyof DataItem,
      header: `Column ${i}`,
    });
  }

  return columns;
};

const columns = createColumns();

export default function FrozenDataTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // For tracking the width of frozen columns
  const calculateLeftOffset = (columnIndex: number) => {
    let offset = 0;
    for (let i = 0; i < columnIndex; i++) {
      if ((columns[i].meta as ColumnMeta)?.frozen) {
        // Using fixed width for simplicity, adjust as needed
        offset += 150;
      }
    }
    return offset;
  };

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-2">
        <Input
          placeholder="Filter column 1..."
          value={(table.getColumn('col1')?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn('col1')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <Settings2 className="h-4 w-4 mr-2" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter(column => column.getCanHide())
              .slice(0, 10) // Only show first 10 columns in dropdown to avoid menu being too long
              .map(column => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="relative border rounded-md overflow-hidden">
        <div 
          className="overflow-auto"
          style={{ 
            maxHeight: '400px',
            maxWidth: '100%'
          }}
        >
          <Table>
            <TableHeader>
              {table.getHeaderGroups().slice(0, 2).map((headerGroup, groupIndex) => (
                <TableRow 
                  key={headerGroup.id}
                  className="sticky bg-background" 
                  style={{ 
                    top: `${groupIndex * 41}px`, // 41px is approximate row height
                    zIndex: 20
                  }}
                >
                  {headerGroup.headers.map((header, colIndex) => {
                    const isFrozen = !!(header.column.columnDef.meta as ColumnMeta)?.frozen;
                    const leftOffset = isFrozen ? calculateLeftOffset(colIndex) : undefined;
                    
                    return (
                      <TableHead
                        key={header.id}
                        style={{
                          minWidth: '150px',
                          position: isFrozen ? 'sticky' : undefined,
                          left: isFrozen ? `${leftOffset}px` : undefined,
                          zIndex: isFrozen ? 30 : undefined,
                          backgroundColor: isFrozen ? 'var(--background)' : undefined,
                          boxShadow: isFrozen ? '1px 0 0 0 #e5e7eb' : undefined
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              headerGroup.id === table.getHeaderGroups()[0].id
                                ? header.column.columnDef.header
                                : `Sub-header ${colIndex + 1}`,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow 
                  key={row.id} 
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell, cellIndex) => {
                    const isFrozen = !!(cell.column.columnDef.meta as ColumnMeta)?.frozen;
                    const leftOffset = isFrozen ? calculateLeftOffset(cellIndex) : undefined;
                    
                    return (
                      <TableCell
                        key={cell.id}
                        style={{
                          minWidth: '150px',
                          position: isFrozen ? 'sticky' : undefined,
                          left: isFrozen ? `${leftOffset}px` : undefined,
                          zIndex: isFrozen ? 10 : undefined,
                          backgroundColor: isFrozen ? 'var(--background)' : undefined,
                          boxShadow: isFrozen ? '1px 0 0 0 #e5e7eb' : undefined
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
      
      <div className="flex items-center justify-between py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
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
            
            {Array.from({ length: Math.min(5, table.getPageCount()) }).map((_, i) => (
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
