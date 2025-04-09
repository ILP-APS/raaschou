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

// Keep your interfaces and data generation the same

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

  // Keep your filter inputs and column visibility menu the same

  return (
    <div className="w-full">
      {/* Keep your existing filter and column selectors */}
      
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
      
      {/* Keep your pagination and row selection counter */}
    </div>
  );
}