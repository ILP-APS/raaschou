
import React from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
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

// Generate 50 rows of sample data
const data = Array.from({ length: 50 }).map((_, i) => ({
  id: `${i + 1}`,
  name: `Project ${i + 1}`,
  col1: `Bud-${i + 1}-1`,
  col2: `Bud-${i + 1}-2`,
  col3: `Bud-${i + 1}-3`,
  col4: `Bud-${i + 1}-4`,
  col5: `Bud-${i + 1}-5`,
  col6: `Bud-${i + 1}-6`, 
  col7: `Bud-${i + 1}-7`,
  col8: `Bud-${i + 1}-8`,
  col9: `Bud-${i + 1}-9`,
  col10: `Bud-${i + 1}-10`,
  col11: `Bud-${i + 1}-11`,
  col12: `Bud-${i + 1}-12`
}));

const columns = [
  {
    accessorKey: 'id',
    header: 'ID',
    meta: { sticky: true, index: 0 }
  },
  {
    accessorKey: 'name',
    header: 'Name',
    meta: { sticky: true, index: 1 }
  },
  {
    accessorKey: 'col1',
    header: 'Budget 1'
  },
  {
    accessorKey: 'col2',
    header: 'Budget 2'
  },
  {
    accessorKey: 'col3',
    header: 'Budget 3'
  },
  {
    accessorKey: 'col4',
    header: 'Budget 4'
  },
  {
    accessorKey: 'col5',
    header: 'Budget 5'
  },
  {
    accessorKey: 'col6',
    header: 'Budget 6'
  },
  {
    accessorKey: 'col7',
    header: 'Budget 7'
  },
  {
    accessorKey: 'col8',
    header: 'Budget 8'
  },
  {
    accessorKey: 'col9',
    header: 'Budget 9'
  },
  {
    accessorKey: 'col10',
    header: 'Budget 10'
  },
  {
    accessorKey: 'col11',
    header: 'Budget 11'
  },
  {
    accessorKey: 'col12',
    header: 'Budget 12'
  }
];

// Define header groups
const headerGroups = [
  { title: 'Info', colSpan: 2 },          // Group 1: 2 cols (ID, Name)
  { title: 'Budget Group A', colSpan: 5 }, // Group 2: 5 cols
  { title: 'Budget Group B', colSpan: 4 }, // Group 3: 4 cols
  { title: 'Special', colSpan: 1 },       // Group 4: 1 col
  { title: 'Budget Group C', colSpan: 2 }  // Group 5: 2 cols
];

export default function MinimalStickyTable() {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Function to calculate left position for each sticky column
  const getLeftPosition = (index: number) => {
    if (index === 0) return 0;
    if (index === 1) return '80px'; // Width of first column
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
      maxWidth: '800px', // Restrict container width to force horizontal scrolling
      height: '400px', // Fixed height to force vertical scrolling
      overflowX: 'auto',
      overflowY: 'auto',
      maxHeight: '70vh',
      border: '1px solid hsl(var(--border))',
      borderRadius: '0.5rem'
    }}>
      <Table style={{ 
        width: 'auto', 
        minWidth: '1500px', // Force table to be wider than container
        borderCollapse: 'separate'
      }}>
        <TableHeader>
          {/* Header group row */}
          <TableRow>
            {headerGroups.map((group, groupIndex) => {
              // Calculate if this is a sticky group (only the first group with Info)
              const isSticky = groupIndex === 0;
              
              return (
                <TableHead
                  key={`group-${groupIndex}`}
                  colSpan={group.colSpan}
                  style={{
                    position: 'sticky',
                    top: 0,
                    left: isSticky ? 0 : 'auto',
                    zIndex: isSticky ? 60 : 50,
                    backgroundColor: getBgColor(),
                    textAlign: 'center',
                    fontWeight: 'bold',
                    height: headerGroupHeight,
                    boxShadow: isSticky ? '2px 2px 5px -2px rgba(0,0,0,0.15)' : '0 2px 0 0 rgba(0,0,0,0.1)',
                    borderBottom: '1px solid hsl(var(--border))'
                  }}
                >
                  {group.title}
                </TableHead>
              );
            })}
          </TableRow>
          
          {/* Regular header row */}
          <TableRow>
            {table.getFlatHeaders().map((header, index) => {
              const isSticky = !!(header.column.columnDef.meta as any)?.sticky;
              const stickyIndex = (header.column.columnDef.meta as any)?.index || 0;
              
              return (
                <TableHead
                  key={header.id}
                  style={{
                    width: index === 0 ? '80px' : '150px',
                    minWidth: index === 0 ? '80px' : '150px',
                    position: 'sticky',
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
                  const isSticky = !!(cell.column.columnDef.meta as any)?.sticky;
                  const stickyIndex = (cell.column.columnDef.meta as any)?.index || 0;
                  
                  return (
                    <TableCell
                      key={cell.id}
                      style={{
                        width: cellIndex === 0 ? '80px' : '150px',
                        minWidth: cellIndex === 0 ? '80px' : '150px',
                        position: isSticky ? 'sticky' : undefined,
                        left: isSticky ? getLeftPosition(stickyIndex) : undefined,
                        zIndex: isSticky ? 20 : undefined,
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
