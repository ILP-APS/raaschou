
import React, { useState, useRef, useEffect } from 'react';
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
}

// Define custom metadata for our columns
interface ColumnMeta {
  frozen?: boolean;
}

// Generate sample data with 22 columns
const generateSampleData = () => {
  const data: DataItem[] = [];
  for (let i = 1; i <= 50; i++) {
    const row: any = { id: i };
    for (let j = 1; j <= 22; j++) {
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
  for (let i = 3; i <= 22; i++) {
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
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
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
      
      {/* Main table container with overflow */}
      <div className="relative border rounded-md" style={{ overflow: 'hidden' }}>
        <div 
          ref={tableContainerRef}
          style={{ 
            maxHeight: '400px',
            width: '100%',
            overflow: 'auto'
          }}
        >
          <Table>
            <TableHeader>
              {/* First header row */}
              <TableRow style={{ 
                position: 'sticky', 
                top: 0, 
                zIndex: 50,
                backgroundColor: 'white' 
              }}>
                {table.getHeaderGroups()[0].headers.map((header, colIndex) => {
                  const isFrozen = !!(header.column.columnDef.meta as ColumnMeta)?.frozen;
                  
                  // Calculate left for frozen columns
                  let leftPosition = 0;
                  if (isFrozen) {
                    for (let i = 0; i < colIndex; i++) {
                      if ((table.getHeaderGroups()[0].headers[i].column.columnDef.meta as ColumnMeta)?.frozen) {
                        leftPosition += 150; // Width of each column
                      }
                    }
                  }
                  
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        minWidth: '150px',
                        width: '150px',
                        position: isFrozen ? 'sticky' : 'static',
                        left: isFrozen ? `${leftPosition}px` : 'auto',
                        zIndex: isFrozen ? 60 : 50,
                        backgroundColor: 'white',
                        boxShadow: isFrozen ? '4px 0 4px -2px rgba(0,0,0,0.15)' : 'none',
                        borderRight: isFrozen ? '1px solid #e5e7eb' : 'none'
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
              
              {/* Second header row */}
              <TableRow style={{ 
                position: 'sticky', 
                top: '41px',  // Adjust based on your actual first row height
                zIndex: 50,
                backgroundColor: '#f5f5f5' 
              }}>
                {table.getHeaderGroups()[0].headers.map((header, colIndex) => {
                  const isFrozen = !!(header.column.columnDef.meta as ColumnMeta)?.frozen;
                  
                  // Calculate left for frozen columns
                  let leftPosition = 0;
                  if (isFrozen) {
                    for (let i = 0; i < colIndex; i++) {
                      if ((table.getHeaderGroups()[0].headers[i].column.columnDef.meta as ColumnMeta)?.frozen) {
                        leftPosition += 150;
                      }
                    }
                  }
                  
                  return (
                    <TableHead
                      key={`subheader-${header.id}`}
                      style={{
                        minWidth: '150px',
                        width: '150px',
                        position: isFrozen ? 'sticky' : 'static',
                        left: isFrozen ? `${leftPosition}px` : 'auto',
                        zIndex: isFrozen ? 60 : 50,
                        backgroundColor: '#f5f5f5',
                        boxShadow: isFrozen ? '4px 0 4px -2px rgba(0,0,0,0.15)' : 'none',
                        borderRight: isFrozen ? '1px solid #e5e7eb' : 'none'
                      }}
                    >
                      {`Sub-header ${colIndex + 1}`}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow 
                  key={row.id} 
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell, cellIndex) => {
                    const isFrozen = !!(cell.column.columnDef.meta as ColumnMeta)?.frozen;
                    
                    // Calculate left for frozen columns
                    let leftPosition = 0;
                    if (isFrozen) {
                      for (let i = 0; i < cellIndex; i++) {
                        if ((row.getVisibleCells()[i].column.columnDef.meta as ColumnMeta)?.frozen) {
                          leftPosition += 150;
                        }
                      }
                    }
                    
                    return (
                      <TableCell
                        key={cell.id}
                        style={{
                          minWidth: '150px',
                          width: '150px',
                          position: isFrozen ? 'sticky' : 'static',
                          left: isFrozen ? `${leftPosition}px` : 'auto',
                          zIndex: isFrozen ? 40 : 30,
                          backgroundColor: 'white',
                          boxShadow: isFrozen ? '4px 0 4px -2px rgba(0,0,0,0.15)' : 'none',
                          borderRight: isFrozen ? '1px solid #e5e7eb' : 'none'
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
