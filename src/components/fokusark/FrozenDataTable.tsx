
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
import { tableContainerStyles } from '@/components/FokusarkTableStyles';

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
  const frozenColumnsRef = useRef<HTMLDivElement>(null);
  const mainTableRef = useRef<HTMLDivElement>(null);
  
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

  // Sync scrolling between frozen and main table
  useEffect(() => {
    const mainTable = mainTableRef.current;
    const frozenColumns = frozenColumnsRef.current;
    
    if (!mainTable || !frozenColumns) return;
    
    const handleMainScroll = () => {
      if (frozenColumns) {
        frozenColumns.scrollTop = mainTable.scrollTop;
        
        // Add shadow to frozen columns when scrolling horizontally
        if (mainTable.scrollLeft > 0) {
          frozenColumns.classList.add('with-shadow');
        } else {
          frozenColumns.classList.remove('with-shadow');
        }
      }
    };
    
    mainTable.addEventListener('scroll', handleMainScroll);
    
    return () => {
      mainTable.removeEventListener('scroll', handleMainScroll);
    };
  }, []);

  // Add style tag to the document once
  useEffect(() => {
    const styleId = 'fokusark-table-styles';
    if (!document.getElementById(styleId)) {
      const styleTag = document.createElement('style');
      styleTag.id = styleId;
      styleTag.innerHTML = tableContainerStyles;
      document.head.appendChild(styleTag);
    }
  }, []);

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
      
      {/* Main table container using the styles from FokusarkTableStyles */}
      <div className="fokusark-table-scroll-container">
        <div className="fokusark-table-wrapper">
          {/* Frozen columns table */}
          <div 
            ref={frozenColumnsRef} 
            className="frozen-columns"
            style={{ overflow: 'hidden' }}
          >
            <table className="frozen-table">
              <thead>
                {/* Group header row */}
                <tr>
                  <th colSpan={2} className="group-header">Aftale</th>
                </tr>
                {/* Column header row */}
                <tr>
                  <th className="col-0 column-header">Nr.</th>
                  <th className="col-1 column-header">Navn</th>
                </tr>
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="h-12"
                    data-sub-appointment={false} // Could be dynamic based on your data
                  >
                    <td className="col-0">
                      {row.getVisibleCells()[0] ? 
                        flexRender(
                          row.getVisibleCells()[0].column.columnDef.cell, 
                          row.getVisibleCells()[0].getContext()
                        ) : 
                        null
                      }
                    </td>
                    <td className="col-1">
                      {row.getVisibleCells()[1] ? 
                        flexRender(
                          row.getVisibleCells()[1].column.columnDef.cell, 
                          row.getVisibleCells()[1].getContext()
                        ) : 
                        null
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Main scrollable table */}
          <div 
            ref={mainTableRef} 
            style={{ 
              overflow: 'auto',
              maxHeight: '400px'
            }}
          >
            <table className="fokusark-table">
              <colgroup>
                {table.getVisibleFlatColumns().slice(2).map((column, i) => (
                  <col key={column.id} className="col-scrollable" />
                ))}
              </colgroup>
              <thead>
                {/* Group header row */}
                <tr>
                  <th colSpan={3} className="group-header">Ansvarlig</th>
                  <th colSpan={5} className="group-header">TILBUD</th>
                  <th colSpan={4} className="group-header">Estimeret</th>
                  <th colSpan={4} className="group-header">Realiseret</th>
                  <th colSpan={1} className="group-header">Timer tilbage</th>
                  <th colSpan={5} className="group-header">Produktion</th>
                </tr>
                {/* Column header row */}
                <tr>
                  {table.getVisibleFlatColumns().slice(2).map((column, i) => (
                    <th key={column.id} className="col-scrollable column-header">
                      {typeof column.columnDef.header === 'string' 
                        ? column.columnDef.header 
                        : `Column ${i + 3}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="h-12"
                  >
                    {row.getVisibleCells().slice(2).map((cell) => (
                      <td key={cell.id} className="col-scrollable">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
