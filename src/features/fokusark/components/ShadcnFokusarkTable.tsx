
import React, { useState, useEffect } from "react";
import { flexRender, getCoreRowModel, useReactTable, ColumnDef } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTheme } from "next-themes";
import "./FokusarkDataGridStyles.css";
import { formatDanishCurrency } from '../utils/formatUtils';

type FokusarkColumnMeta = { frozen?: boolean; width?: number; alignment?: 'left' | 'right' | 'center'; format?: 'currency' | 'number' | 'text'; };
interface FokusarkRow { [key: string]: any; id: string; isSubAppointment?: boolean; }
interface ShadcnFokusarkTableProps { data: string[][]; onCellChange?: (rowIndex: number, colIndex: number, value: string) => void; }

const ShadcnFokusarkTable: React.FC<ShadcnFokusarkTableProps> = ({ data, onCellChange }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [rows, setRows] = useState<FokusarkRow[]>([]);

  useEffect(() => {
    if (data && data.length > 0) {
      setRows(transformDataToRows(data));
    } else {
      setRows([]);
    }
  }, [data]);

  const transformDataToRows = (rawData: string[][]): FokusarkRow[] => {
    return (rawData || []).map((row, index) => {
      const rowObj: FokusarkRow = { id: index.toString() };
      const rowType = row.length > 0 ? row[row.length - 1] : null;
      rowObj.isSubAppointment = rowType === 'sub-appointment';
      const columnKeys = ["nr", "navn", "ansvarlig", "tilbud", "montage", "underleverandor", "montage2", "underleverandor2", "materialer", "projektering", "produktion", "montage3", "projektering2", "produktionRealized", "montageRealized", "total", "timerTilbage1", "timerTilbage2", "faerdigPctExMontageNu", "faerdigPctExMontageFoer", "estTimerIftFaerdigPct", "plusMinusTimer", "afsatFragt"];
      for (let i = 0; i < Math.min(row.length - 1, columnKeys.length); i++) {
        rowObj[columnKeys[i]] = row[i] || '';
      }
      return rowObj;
    });
  };

  const formatValue = (value: string, format?: string) => {
    if (!value) return '';
    if (format === 'currency') {
      const numericValue = parseFloat(value.replace(/\./g, '').replace(',', '.'));
      return <div className="text-right font-mono">{!isNaN(numericValue) ? formatDanishCurrency(numericValue) : value}</div>;
    }
    return value;
  };

  const columns: ColumnDef<FokusarkRow, unknown>[] = [
    { accessorKey: 'nr', header: 'Nr.', meta: { frozen: true, width: 100 } as FokusarkColumnMeta },
    { accessorKey: 'navn', header: 'Navn', meta: { frozen: true, width: 180 } as FokusarkColumnMeta },
    { accessorKey: 'ansvarlig', header: 'Ansvarlig', meta: { width: 120 } as FokusarkColumnMeta },
    { accessorKey: 'tilbud', header: 'Tilbud', meta: { width: 140, format: 'currency', alignment: 'right' } as FokusarkColumnMeta, cell: ({ getValue }) => formatValue(getValue() as string, 'currency') },
    { accessorKey: 'montage', header: 'Montage', meta: { width: 140, format: 'currency', alignment: 'right' } as FokusarkColumnMeta, cell: ({ getValue }) => formatValue(getValue() as string, 'currency') },
    { accessorKey: 'underleverandor', header: 'Underleverandør', meta: { width: 140, format: 'currency', alignment: 'right' } as FokusarkColumnMeta, cell: ({ getValue }) => formatValue(getValue() as string, 'currency') },
    { accessorKey: 'materialer', header: 'Materialer', meta: { width: 140, format: 'currency', alignment: 'right' } as FokusarkColumnMeta, cell: ({ getValue }) => formatValue(getValue() as string, 'currency') },
    { accessorKey: 'projektering', header: 'Projektering', meta: { width: 140, format: 'currency', alignment: 'right' } as FokusarkColumnMeta, cell: ({ getValue }) => formatValue(getValue() as string, 'currency') },
    { accessorKey: 'column1', header: 'Column 1', meta: { width: 120 } as FokusarkColumnMeta },
    { accessorKey: 'column2', header: 'Column 2', meta: { width: 120 } as FokusarkColumnMeta },
    { accessorKey: 'column3', header: 'Column 3', meta: { width: 120 } as FokusarkColumnMeta }
  ];

  const getColumnOffset = (index: number): number => {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      const colMeta = columns[i].meta as FokusarkColumnMeta;
      if (colMeta?.frozen) offset += (colMeta?.width || 150);
    }
    return offset;
  };

  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() });

  if (!data || data.length === 0 || rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No data to display</h3>
          <p className="text-muted-foreground">Try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative border border-border rounded-md fokusark-data-grid" style={{ overflow: 'hidden' }}>
      <div className={isDarkMode ? "fokusark-table-container dark" : "fokusark-table-container"} style={{ maxHeight: '70vh', width: '100%', overflow: 'auto' }}>
        <Table style={{ width: 'auto', minWidth: '100%' }}>
          <TableHeader>
            <TableRow style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'hsl(var(--background))' }}>
              {table.getHeaderGroups()[0].headers.map((header, index) => {
                const colMeta = header.column.columnDef.meta as FokusarkColumnMeta;
                const isFrozen = !!colMeta?.frozen;
                const leftOffset = isFrozen ? getColumnOffset(index) : undefined;
                const width = colMeta?.width || 150;
                return (
                  <TableHead key={header.id} style={{ width: `${width}px`, minWidth: `${width}px`, position: isFrozen ? 'sticky' : 'static', left: isFrozen ? `${leftOffset}px` : undefined, zIndex: isFrozen ? 100 : 50, backgroundColor: 'hsl(var(--muted)/50)', boxShadow: isFrozen ? '4px 0 4px -2px rgba(0,0,0,0.15)' : undefined, borderRight: isFrozen ? '1px solid hsl(var(--border))' : undefined, textAlign: colMeta?.alignment || 'left' }}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row, rowIndex) => {
              const isFirstDataRow = rowIndex === 0;
              return (
                <TableRow key={row.id} style={{ position: isFirstDataRow ? 'sticky' : 'static', top: isFirstDataRow ? '41px' : undefined, zIndex: isFirstDataRow ? 40 : 30, backgroundColor: isFirstDataRow ? 'hsl(var(--background))' : undefined }}>
                  {row.getVisibleCells().map((cell, cellIndex) => {
                    const colMeta = cell.column.columnDef.meta as FokusarkColumnMeta;
                    const isFrozen = !!colMeta?.frozen;
                    const leftOffset = isFrozen ? getColumnOffset(cellIndex) : undefined;
                    const width = colMeta?.width || 150;
                    let zIndex = 30;
                    if (isFrozen && isFirstDataRow) zIndex = 90;
                    else if (isFrozen) zIndex = 80;
                    else if (isFirstDataRow) zIndex = 40;
                    return (
                      <TableCell key={cell.id} style={{ width: `${width}px`, minWidth: `${width}px`, position: isFrozen || isFirstDataRow ? 'sticky' : 'static', left: isFrozen ? `${leftOffset}px` : undefined, top: isFrozen && isFirstDataRow ? '41px' : undefined, zIndex, backgroundColor: 'hsl(var(--background))', boxShadow: isFrozen ? '4px 0 4px -2px rgba(0,0,0,0.15)' : undefined, borderRight: isFrozen ? '1px solid hsl(var(--border))' : undefined, textAlign: colMeta?.alignment || 'left' }}>
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
    </div>
  );
};

export default ShadcnFokusarkTable;
