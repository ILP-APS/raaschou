import React, { useState } from 'react';
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
import { toast } from 'sonner';
import { formatDanishCurrency } from '@/utils/formatUtils';
import { parseNumber } from '@/utils/numberFormatUtils';
import EditableCell from './components/EditableCell';

interface ColumnMeta {
  sticky?: boolean;
  index?: number;
  groupIndex?: number;
  isEditable?: boolean;
}

interface MinimalStickyTableProps {
  tableData?: string[][];
  onCellChange?: (rowIndex: number, colIndex: number, value: string) => void;
  onCellBlur?: (rowIndex: number, colIndex: number, value: string) => void;
}

export default function MinimalStickyTable({ 
  tableData = [], 
  onCellChange,
  onCellBlur
}: MinimalStickyTableProps) {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  
  console.log("MinimalStickyTable received data:", {
    rowCount: tableData?.length || 0,
    hasData: tableData && tableData.length > 0,
    firstRow: tableData && tableData.length > 0 ? {
      appointmentNumber: tableData[0][0],
      subject: tableData[0][1],
      responsibleUser: tableData[0][2]
    } : {}
  });
  
  const data = React.useMemo(() => {
    if (!tableData || tableData.length === 0) {
      console.log("No table data provided, returning empty array");
      return [];
    }
    
    const transformed = tableData.map((row, i) => {
      const appointmentNumber = row[0] || '';
      const subject = row[1] || '';
      const isSubAppointment = row[23] === 'sub-appointment';
      
      const rowObj: Record<string, string | boolean> = {
        id: i.toString(),
        appointmentNumber: appointmentNumber,
        subject: subject,
        type: row[2] || '',
        isSubAppointment: isSubAppointment,
      };
      
      for (let j = 3; j < Math.min(row.length, 23); j++) {
        rowObj[`col${j-3}`] = row[j] || '';
      }
      
      return rowObj;
    });
    
    console.log(`Transformed ${transformed.length} rows from raw data`);
    return transformed;
  }, [tableData]);
  
  const handleCellEdit = React.useCallback((rowIndex: number, colIndex: number, value: string) => {
    if (onCellChange) {
      console.log(`Editing cell at row ${rowIndex}, column ${colIndex}, new value: ${value}`);
      onCellChange(rowIndex, colIndex, value);
    }
  }, [onCellChange]);
  
  const handleCellFinalize = React.useCallback((rowIndex: number, colIndex: number, value: string) => {
    if (onCellBlur) {
      console.log(`Finalizing cell at row ${rowIndex}, column ${colIndex}, new value: ${value}`);
      onCellBlur(rowIndex, colIndex, value);
    }
  }, [onCellBlur]);
  
  const isEditableColumn = (colIndex: number): boolean => {
    return colIndex >= 3 && colIndex <= 19;
  };
  
  const isCurrencyColumn = (colIndex: number): boolean => {
    return [3, 4, 5, 6, 7, 8, 9, 10, 11].includes(colIndex);
  };
  
  const formatCellValue = (value: string, isMonetary: boolean = false) => {
    if (!value || value.trim() === '') return '';
    
    if (isMonetary) {
      const numericValue = parseFloat(value.replace(/\./g, '').replace(',', '.'));
      return !isNaN(numericValue) ? formatDanishCurrency(numericValue) : value;
    }
    
    return value;
  };
  
  const columns = React.useMemo<ColumnDef<Record<string, string | boolean>, any>[]>(() => [
    { 
      accessorKey: 'appointmentNumber', 
      header: 'Nr.', 
      meta: { sticky: true, index: 0, groupIndex: 0 } as ColumnMeta,
      cell: info => info.getValue()
    },
    { 
      accessorKey: 'subject', 
      header: 'Navn', 
      meta: { sticky: true, index: 1, groupIndex: 0 } as ColumnMeta,
      cell: info => info.getValue()
    },
    { 
      accessorKey: 'type', 
      header: 'Ansvarlig',
      meta: { groupIndex: 1 } as ColumnMeta
    },
    
    {
      accessorKey: `col0`,
      header: `Tilbud`, 
      meta: { groupIndex: 2, isEditable: true } as ColumnMeta,
      cell: info => formatCellValue(info.getValue() as string, true)
    },
    {
      accessorKey: `col1`,
      header: `Montage`,
      meta: { groupIndex: 2, isEditable: true } as ColumnMeta,
      cell: info => formatCellValue(info.getValue() as string, true)
    },
    {
      accessorKey: `col2`,
      header: `Underleverandør`,
      meta: { groupIndex: 2, isEditable: true } as ColumnMeta,
      cell: info => formatCellValue(info.getValue() as string, true)
    },
    {
      accessorKey: `col3`,
      header: `Montage 2`,
      meta: { groupIndex: 2, isEditable: true } as ColumnMeta,
      cell: ({ getValue, row, column }) => {
        const value = getValue() as string;
        const rowId = parseInt(row.id);
        const colIndex = 6;
        
        return (
          <EditableCell 
            value={value}
            isCurrency={true}
            onChange={(newValue) => handleCellEdit(rowId, colIndex, newValue)}
            onlyUpdateOnBlurOrEnter={true}
          />
        );
      }
    },
    {
      accessorKey: `col4`,
      header: `Underleverandør 2`,
      meta: { groupIndex: 2, isEditable: true } as ColumnMeta,
      cell: ({ getValue, row, column }) => {
        const value = getValue() as string;
        const rowId = parseInt(row.id);
        const colIndex = 7;
        
        return (
          <EditableCell 
            value={value}
            isCurrency={true}
            onChange={(newValue) => {
              handleCellEdit(rowId, colIndex, newValue);
              handleCellFinalize(rowId, colIndex, newValue);
            }}
            onlyUpdateOnBlurOrEnter={true}
          />
        );
      }
    },
    
    {
      accessorKey: `col5`,
      header: `Materialer`, 
      meta: { groupIndex: 3 } as ColumnMeta,
      cell: info => formatCellValue(info.getValue() as string, true)
    },
    {
      accessorKey: `col6`,
      header: `Projektering`,
      meta: { groupIndex: 3 } as ColumnMeta,
      cell: info => formatCellValue(info.getValue() as string, true)
    },
    {
      accessorKey: `col7`,
      header: `Produktion`,
      meta: { groupIndex: 3 } as ColumnMeta,
      cell: info => formatCellValue(info.getValue() as string, true)
    },
    {
      accessorKey: `col8`,
      header: `Montage 3`,
      meta: { groupIndex: 3 } as ColumnMeta,
      cell: info => formatCellValue(info.getValue() as string, true)
    },
    
    {
      accessorKey: `col9`,
      header: `Proj. Realiseret`,
      meta: { groupIndex: 4 } as ColumnMeta,
      cell: info => formatCellValue(info.getValue() as string, true)
    },
    {
      accessorKey: `col10`,
      header: `Prod. Realiseret`,
      meta: { groupIndex: 4 } as ColumnMeta,
      cell: info => formatCellValue(info.getValue() as string, true)
    },
    {
      accessorKey: `col11`,
      header: `Mont. Realiseret`,
      meta: { groupIndex: 4 } as ColumnMeta,
      cell: info => formatCellValue(info.getValue() as string, true)
    },
    {
      accessorKey: `col12`,
      header: `Total Realiseret`,
      meta: { groupIndex: 4 } as ColumnMeta,
      cell: info => formatCellValue(info.getValue() as string, true)
    },
    
    {
      accessorKey: `col13`,
      header: `Special`,
      meta: { groupIndex: 5 } as ColumnMeta
    },
    
    ...Array.from({ length: 5 }).map((_, i) => ({
      accessorKey: `col${i + 14}`,
      header: `${i === 0 ? 'Færdig % Nu' : 
              i === 1 ? 'Færdig % Før' : 
              i === 2 ? 'Est. Timer' : 
              i === 3 ? '+/- Timer' : 
              'Afsat Fragt'}`,
      meta: { groupIndex: 6 } as ColumnMeta
    })),
    
    ...Array.from({ length: 2 }).map((_, i) => ({
      accessorKey: `col${i + 19}`,
      header: `Summary ${i + 1}`,
      meta: { groupIndex: 7 } as ColumnMeta
    }))
  ], [handleCellEdit, handleCellFinalize]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const columnGroups = [
    { name: 'Aftale', span: 2, index: 0 },
    { name: '', span: 1, index: 1 },
    { name: 'Tilbud', span: 5, index: 2 },
    { name: 'Budget Group B', span: 4, index: 3 },
    { name: 'Budget Group C', span: 4, index: 4 },
    { name: 'Special', span: 1, index: 5 },
    { name: 'Budget Group D', span: 5, index: 6 },
    { name: 'Summary', span: 2, index: 7 }
  ];
  
  const getGroupBgColor = (groupIndex: number) => {
    if (isDarkMode) {
      return groupIndex % 2 === 0 ? 'hsl(var(--background))' : 'hsl(var(--muted))';
    } else {
      return groupIndex % 2 === 0 ? 'hsl(var(--background))' : 'hsl(var(--muted)/10)';
    }
  };

  const headerHeight = '41px';
  
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No data to display</h3>
          <p className="text-muted-foreground">
            Please check the data source or try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-wrapper" style={{
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid hsl(var(--border))',
      borderRadius: '8px',
      height: '600px',
      minHeight: '600px',
      maxHeight: '80vh'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}>
        <Table style={{ 
          width: 'auto',
          minWidth: '100%'
        }}>
          <TableHeader>
            <TableRow>
              {columnGroups.map((group, index) => (
                <TableHead
                  key={`group-${index}`}
                  colSpan={group.span}
                  style={{
                    position: 'sticky',
                    top: 0,
                    left: index === 0 ? 0 : undefined,
                    zIndex: index === 0 ? 60 : 50,
                    backgroundColor: getGroupBgColor(index),
                    textAlign: 'center',
                    fontWeight: 'bold',
                    borderBottom: '1px solid hsl(var(--border))',
                    minWidth: index === 0 ? '350px' : undefined,
                    boxShadow: index === 0 
                      ? '1px 0 0 0 hsl(var(--border)), 0 1px 0 0 hsl(var(--border))' 
                      : '0 1px 0 0 hsl(var(--border))'
                  }}
                >
                  {group.name}
                </TableHead>
              ))}
            </TableRow>
            
            <TableRow>
              {table.getFlatHeaders().map((header) => {
                const meta = header.column.columnDef.meta as ColumnMeta | undefined;
                const isSticky = meta?.sticky;
                const stickyIndex = meta?.index || 0;
                const groupIndex = meta?.groupIndex || 0;
                
                return (
                  <TableHead
                    key={header.id}
                    style={{
                      position: 'sticky',
                      top: headerHeight,
                      left: isSticky ? (stickyIndex === 0 ? 0 : '150px') : undefined,
                      zIndex: isSticky ? 55 : 45,
                      minWidth: stickyIndex === 0 ? '150px' : (stickyIndex === 1 ? '200px' : '150px'),
                      backgroundColor: getGroupBgColor(groupIndex),
                      boxShadow: isSticky ? 
                        '1px 0 0 0 hsl(var(--border)), 0 1px 0 0 hsl(var(--border))' : 
                        '0 1px 0 0 hsl(var(--border))'
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
            {table.getRowModel().rows.map((row) => {
              const isSubAppointment = row.original.isSubAppointment === true;
              
              return (
                <TableRow 
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as ColumnMeta | undefined;
                    const isSticky = meta?.sticky;
                    const stickyIndex = meta?.index || 0;
                    const groupIndex = meta?.groupIndex || 0;
                    
                    const paddingStyle = (cell.column.id === 'appointmentNumber' && isSubAppointment) ? 
                      { paddingLeft: '1.5rem' } : {};
                    
                    return (
                      <TableCell
                        key={cell.id}
                        style={{
                          position: isSticky ? 'sticky' : undefined,
                          left: isSticky ? (stickyIndex === 0 ? 0 : '150px') : undefined,
                          zIndex: isSticky ? 20 : undefined,
                          minWidth: stickyIndex === 0 ? '150px' : (stickyIndex === 1 ? '200px' : '150px'),
                          backgroundColor: getGroupBgColor(groupIndex),
                          boxShadow: isSticky ? '1px 0 0 0 hsl(var(--border))' : undefined,
                          padding: meta?.isEditable ? '0' : undefined,
                          ...paddingStyle
                        }}
                      >
                        {cell.column.id === 'appointmentNumber' && isSubAppointment ? (
                          <div className="flex items-center">
                            <span className="text-muted-foreground mr-2">└</span>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        ) : (
                          flexRender(cell.column.columnDef.cell, cell.getContext())
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
