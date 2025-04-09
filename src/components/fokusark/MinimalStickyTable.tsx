
import React from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
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
import { useTheme } from 'next-themes';

// Define custom column meta type to support our sticky properties
interface ColumnMeta {
  sticky?: boolean;
  index?: number;
  group?: string;
}

interface MinimalStickyTableProps {
  tableData?: string[][];
}

export default function MinimalStickyTable({ tableData = [] }: MinimalStickyTableProps) {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  
  // Define fixed column widths
  const idColWidth = '80px';
  const nameColWidth = '180px';
  const standardColWidth = '150px';
  const infoGroupWidth = '260px'; // Combined width for ID + Name columns only
  
  // Transform tableData into usable data for the table
  const data = React.useMemo(() => {
    if (!tableData || tableData.length === 0) {
      // Provide default data if none is passed
      return Array.from({ length: 10 }).map((_, i) => ({
        id: `${i + 1}`,
        name: `Project ${i + 1}`,
        type: `Type ${i % 4 + 1}`,
        // Add sample data for other columns
        ...(Object.fromEntries(
          Array.from({ length: 20 }).map((_, j) => [`col${j}`, `Value ${i}-${j}`])
        ))
      }));
    }
    
    // Convert the 2D array data to objects
    return tableData.map((row, i) => {
      const rowObj: Record<string, string> = {
        id: row[0] || `${i + 1}`,
        name: row[1] || `Project ${i + 1}`,
        type: row[2] || `Type ${i % 4 + 1}`,
      };
      
      // Add remaining columns
      for (let j = 3; j < row.length; j++) {
        rowObj[`col${j-3}`] = row[j] || `Value ${i}-${j}`;
      }
      
      return rowObj;
    });
  }, [tableData]);
  
  // Define columns with proper grouping
  const columns = React.useMemo<ColumnDef<Record<string, string>, unknown>[]>(() => [
    // Group 1: Info (3 cols)
    { 
      accessorKey: 'id', 
      header: 'ID', 
      meta: { sticky: true, index: 0, group: 'Info' } as ColumnMeta
    },
    { 
      accessorKey: 'name', 
      header: 'Name', 
      meta: { sticky: true, index: 1, group: 'Info' } as ColumnMeta
    },
    { 
      accessorKey: 'type', 
      header: 'Type', 
      meta: { group: 'Info' } as ColumnMeta
    },
    
    // Other columns
    ...Array.from({ length: 20 }).map((_, i) => ({
      accessorKey: `col${i}`,
      header: `Column ${i + 1}`,
      meta: { group: `Group ${Math.floor(i / 4) + 1}` } as ColumnMeta
    }))
  ], []);

  // Define the header groups explicitly
  const headerGroups = [
    { id: 'Info', title: 'Info', colSpan: 3 },
    { id: 'Group 1', title: 'Group 1', colSpan: 4 },
    { id: 'Group 2', title: 'Group 2', colSpan: 4 },
    { id: 'Group 3', title: 'Group 3', colSpan: 4 },
    { id: 'Group 4', title: 'Group 4', colSpan: 4 },
    { id: 'Group 5', title: 'Group 5', colSpan: 4 }
  ];
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Function to calculate left position for each sticky column
  const getLeftPosition = (index: number) => {
    if (index === 0) return 0;
    if (index === 1) return idColWidth; // Width of first column
    return undefined;
  };

  // Get background color based on theme
  const getBgColor = (isEvenRow: boolean = false) => {
    if (isDarkMode) {
      return isEvenRow ? 'hsl(var(--muted)/20)' : 'hsl(var(--background))';
    } else {
      return isEvenRow ? 'hsl(var(--muted)/10)' : 'hsl(var(--background))';
    }
  };

  // Header group row height
  const headerGroupHeight = '40px';

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      overflowX: 'auto',
      overflowY: 'auto',
      maxHeight: '70vh',
      border: '1px solid hsl(var(--border))',
      borderRadius: '0.5rem'
    }}>
      <Table style={{ 
        width: 'auto', 
        minWidth: '1800px', // Sufficient width for all columns
        borderCollapse: 'separate'
      }}>
        <TableHeader>
          {/* Header group row with split Info group */}
          <TableRow>
            {/* Sticky part of Info group (covering ID and Name only) */}
            <TableHead
              key="sticky-info-group"
              colSpan={2} // Only span the 2 sticky columns
              style={{
                position: 'sticky',
                top: 0,
                left: 0,
                zIndex: 60,
                backgroundColor: getBgColor(),
                textAlign: 'center',
                fontWeight: 'bold',
                boxShadow: '2px 2px 5px -2px rgba(0,0,0,0.15)',
                borderBottom: '1px solid hsl(var(--border))',
                width: infoGroupWidth,
                minWidth: infoGroupWidth
              }}
            >
              Info
            </TableHead>
            
            {/* Non-sticky part of Info group (just the Type column) */}
            <TableHead
              key="non-sticky-info-group"
              colSpan={1} // Just the Type column
              style={{
                position: 'static',
                top: 0,
                zIndex: 50,
                backgroundColor: getBgColor(),
                textAlign: 'center',
                fontWeight: 'bold',
                boxShadow: '0 2px 0 0 rgba(0,0,0,0.1)',
                borderBottom: '1px solid hsl(var(--border))'
              }}
            >
              Info
            </TableHead>
            
            {/* The rest of the header groups */}
            {headerGroups.slice(1).map((group) => (
              <TableHead
                key={`group-${group.id}`}
                colSpan={group.colSpan}
                style={{
                  position: 'static',
                  top: 0,
                  zIndex: 50,
                  backgroundColor: getBgColor(),
                  textAlign: 'center',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 0 0 rgba(0,0,0,0.1)',
                  borderBottom: '1px solid hsl(var(--border))'
                }}
              >
                {group.title}
              </TableHead>
            ))}
          </TableRow>
          
          {/* Regular header row */}
          <TableRow>
            {table.getFlatHeaders().map((header, index) => {
              const columnMeta = header.column.columnDef.meta as ColumnMeta || {};
              const isSticky = columnMeta && columnMeta.sticky || false;
              const stickyIndex = columnMeta && columnMeta.index || 0;
              const isIdCol = index === 0;
              const isNameCol = index === 1;
              
              return (
                <TableHead
                  key={header.id}
                  style={{
                    minWidth: isIdCol ? idColWidth : isNameCol ? nameColWidth : standardColWidth,
                    width: isIdCol ? idColWidth : isNameCol ? nameColWidth : standardColWidth,
                    position: isSticky ? 'sticky' : 'static',
                    top: headerGroupHeight, // Position below the group header
                    left: isSticky ? getLeftPosition(stickyIndex) : undefined,
                    zIndex: isSticky ? 45 : 40,
                    backgroundColor: getBgColor(),
                    boxShadow: isSticky 
                      ? '2px 2px 5px -2px rgba(0,0,0,0.15)'
                      : '0 2px 5px -2px rgba(0,0,0,0.15)'
                  }}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row, rowIndex) => {
            const isEvenRow = rowIndex % 2 === 1;
            
            return (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell, cellIndex) => {
                  const columnMeta = cell.column.columnDef.meta as ColumnMeta || {};
                  const isSticky = columnMeta && columnMeta.sticky || false;
                  const stickyIndex = columnMeta && columnMeta.index || 0;
                  const isIdCol = cellIndex === 0;
                  const isNameCol = cellIndex === 1;
                  
                  return (
                    <TableCell
                      key={cell.id}
                      style={{
                        width: isIdCol ? idColWidth : isNameCol ? nameColWidth : standardColWidth,
                        minWidth: isIdCol ? idColWidth : isNameCol ? nameColWidth : standardColWidth,
                        position: isSticky ? 'sticky' : 'static',
                        left: isSticky ? getLeftPosition(stickyIndex) : undefined,
                        zIndex: isSticky ? 20 : 0,
                        backgroundColor: getBgColor(isEvenRow),
                        boxShadow: isSticky ? '2px 0 5px -2px rgba(0,0,0,0.15)' : undefined
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
