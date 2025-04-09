
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

const columns = [
  { accessorKey: 'id', header: 'ID', meta: { sticky: true, index: 0, group: 'Info' } },
  { accessorKey: 'name', header: 'Name', meta: { sticky: true, index: 1, group: 'Info' } },
  { accessorKey: 'type', header: 'Type', meta: { group: 'Info' } },
  
  { accessorKey: 'budA1', header: 'Budget 1', meta: { group: 'Budget Group A' } },
  { accessorKey: 'budA2', header: 'Budget 2', meta: { group: 'Budget Group A' } },
  { accessorKey: 'budA3', header: 'Budget 3', meta: { group: 'Budget Group A' } },
  { accessorKey: 'budA4', header: 'Budget 4', meta: { group: 'Budget Group A' } },
  { accessorKey: 'budA5', header: 'Budget 5', meta: { group: 'Budget Group A' } },
  
  { accessorKey: 'budB1', header: 'Budget 6', meta: { group: 'Budget Group B' } },
  { accessorKey: 'budB2', header: 'Budget 7', meta: { group: 'Budget Group B' } },
  { accessorKey: 'budB3', header: 'Budget 8', meta: { group: 'Budget Group B' } },
  { accessorKey: 'budB4', header: 'Budget 9', meta: { group: 'Budget Group B' } },
  
  { accessorKey: 'budC1', header: 'Budget 10', meta: { group: 'Budget Group C' } },
  { accessorKey: 'budC2', header: 'Budget 11', meta: { group: 'Budget Group C' } },
  { accessorKey: 'budC3', header: 'Budget 12', meta: { group: 'Budget Group C' } },
  { accessorKey: 'budC4', header: 'Budget 13', meta: { group: 'Budget Group C' } },
  
  { accessorKey: 'special', header: 'Special', meta: { group: 'Special' } },
  
  { accessorKey: 'budD1', header: 'Budget 14', meta: { group: 'Budget Group D' } },
  { accessorKey: 'budD2', header: 'Budget 15', meta: { group: 'Budget Group D' } },
  { accessorKey: 'budD3', header: 'Budget 16', meta: { group: 'Budget Group D' } },
  { accessorKey: 'budD4', header: 'Budget 17', meta: { group: 'Budget Group D' } },
  { accessorKey: 'budD5', header: 'Budget 18', meta: { group: 'Budget Group D' } },
  
  { accessorKey: 'sum1', header: 'Total', meta: { group: 'Summary' } },
  { accessorKey: 'sum2', header: 'Average', meta: { group: 'Summary' } }
];

const headerGroups = [
  { id: 'Info', title: 'Info', colSpan: 3 },
  { id: 'Budget Group A', title: 'Budget Group A', colSpan: 5 },
  { id: 'Budget Group B', title: 'Budget Group B', colSpan: 4 },
  { id: 'Budget Group C', title: 'Budget Group C', colSpan: 4 },
  { id: 'Special', title: 'Special', colSpan: 1 },
  { id: 'Budget Group D', title: 'Budget Group D', colSpan: 5 },
  { id: 'Summary', title: 'Summary', colSpan: 2 }
];

const data = Array.from({ length: 50 }).map((_, i) => {
  const rowData: Record<string, string> = {
    id: `${i + 1}`,
    name: `Project ${i + 1}`,
    type: `Type ${i % 4 + 1}`,
  };
  
  for (let j = 1; j <= 5; j++) {
    rowData[`budA${j}`] = `Bud-A${i + 1}-${j}`;
  }
  
  for (let j = 1; j <= 4; j++) {
    rowData[`budB${j}`] = `Bud-B${i + 1}-${j}`;
  }
  
  for (let j = 1; j <= 4; j++) {
    rowData[`budC${j}`] = `Bud-C${i + 1}-${j}`;
  }
  
  rowData.special = `Special ${i + 1}`;
  
  for (let j = 1; j <= 5; j++) {
    rowData[`budD${j}`] = `Bud-D${i + 1}-${j}`;
  }
  
  rowData.sum1 = `Total ${i + 1}`;
  rowData.sum2 = `Avg ${i + 1}`;
  
  return rowData;
});

export default function MinimalStickyTable() {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const getLeftPosition = (index: number) => {
    if (index === 0) return 0;
    if (index === 1) return '80px';
    return undefined;
  };

  const getBgColor = (isEvenRow: boolean = false) => {
    if (isDarkMode) {
      return isEvenRow ? 'hsl(var(--muted)/20)' : 'hsl(var(--background))';
    } else {
      return isEvenRow ? 'hsl(var(--muted)/10)' : 'hsl(var(--background))';
    }
  };

  const headerGroupHeight = '40px';
  const headerBgColor = getBgColor();

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: '800px',
      height: '400px',
      overflowX: 'auto',
      overflowY: 'auto',
      maxHeight: '70vh',
      border: '1px solid hsl(var(--border))',
      borderRadius: '0.5rem'
    }}>
      <Table style={{ 
        width: 'auto', 
        minWidth: '2400px',
        borderCollapse: 'separate'
      }}>
        <TableHeader>
          <TableRow>
            {headerGroups.map((group, groupIndex) => {
              const isInfoGroup = group.id === 'Info';
              
              return (
                <TableHead
                  key={`group-${group.id}`}
                  colSpan={group.colSpan}
                  style={{
                    position: isInfoGroup ? 'relative' : 'static',
                    top: 0,
                    zIndex: isInfoGroup ? 100 : 50,
                    backgroundColor: headerBgColor,
                    textAlign: 'center',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 0 0 rgba(0,0,0,0.1)',
                    borderBottom: '1px solid hsl(var(--border))',
                    height: headerGroupHeight
                  }}
                >
                  {!isInfoGroup && group.title}
                  
                  {isInfoGroup && (
                    <>
                      {/* Full-width overlay for the Info header */}
                      <div 
                        style={{ 
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center',
                          backgroundColor: headerBgColor
                        }}
                      >
                        {group.title}
                      </div>
                      
                      {/* Sticky overlay that stays in place when scrolling horizontally */}
                      <div
                        style={{
                          position: 'sticky',
                          left: 0,
                          top: 0,
                          width: '260px', // This needs to cover ID + Name columns
                          height: '100%',
                          backgroundColor: headerBgColor,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          zIndex: 1,
                          boxShadow: '2px 0 5px -2px rgba(0,0,0,0.15)'
                        }}
                      >
                        {group.title}
                      </div>
                    </>
                  )}
                </TableHead>
              );
            })}
          </TableRow>
          
          <TableRow>
            {table.getFlatHeaders().map((header, index) => {
              const isSticky = !!(header.column.columnDef.meta as any)?.sticky;
              const stickyIndex = (header.column.columnDef.meta as any)?.index || 0;
              
              return (
                <TableHead
                  key={header.id}
                  style={{
                    minWidth: '150px',
                    width: index === 0 ? '80px' : index === 1 ? '180px' : '150px',
                    position: 'sticky',
                    top: headerGroupHeight,
                    left: isSticky ? getLeftPosition(stickyIndex) : undefined,
                    zIndex: isSticky ? 45 : 40,
                    backgroundColor: headerBgColor,
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
                        width: cellIndex === 0 ? '80px' : cellIndex === 1 ? '180px' : '150px',
                        minWidth: cellIndex === 0 ? '80px' : cellIndex === 1 ? '180px' : '150px',
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
