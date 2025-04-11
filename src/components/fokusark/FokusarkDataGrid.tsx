import React, { useState, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTheme } from "next-themes";
import "./FokusarkDataGridStyles.css";
import { formatDanishCurrency } from "@/utils/formatUtils";
import { parseNumber } from "@/utils/numberFormatUtils";
import { toast } from "sonner";

interface FokusarkColumnMeta {
  frozen?: boolean;
}

interface FokusarkRow {
  [key: string]: string | number | boolean;
  id: string;
  isSubAppointment?: boolean;
}

interface FokusarkDataGridProps {
  data: string[][];
  onCellChange?: (rowIndex: number, colIndex: number, value: string) => void;
  onCellBlur?: (rowIndex: number, colIndex: number, value: string) => void;
}

const FokusarkDataGrid: React.FC<FokusarkDataGridProps> = ({ data, onCellChange, onCellBlur }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [rows, setRows] = useState<FokusarkRow[]>([]);

  useEffect(() => {
    console.log("FokusarkDataGrid received data:", data?.length || 0, "rows");
    if (data && data.length > 0) {
      const transformedRows = transformDataToRows(data);
      console.log("Transformed to", transformedRows.length, "grid rows");
      setRows(transformedRows);
    } else {
      console.log("No data to transform");
      setRows([]);
    }
  }, [data]);

  const transformDataToRows = (rawData: string[][]): FokusarkRow[] => {
    return (rawData || []).map((row, index) => {
      const rowObj: FokusarkRow = { id: index.toString() };
      
      const rowType = row.length > 0 ? row[row.length - 1] : null;
      rowObj.isSubAppointment = rowType === 'sub-appointment';
      
      const columnKeys = [
        "nr", "navn", "ansvarlig", "tilbud", "montage", "underleverandor", 
        "montage2", "underleverandor2", "materialer", "projektering", 
        "produktion", "montage3", "projektering2", "produktionRealized", 
        "montageRealized", "total", "timerTilbage1", "timerTilbage2", 
        "faerdigPctExMontageNu", "faerdigPctExMontageFoer", 
        "estTimerIftFaerdigPct", "plusMinusTimer", "afsatFragt"
      ];
      
      for (let i = 0; i < Math.min(row.length - 1, columnKeys.length); i++) {
        rowObj[columnKeys[i]] = row[i] || '';
      }
      
      return rowObj;
    });
  };

  const handleInputBlur = (rowIndex: number, colIndex: number, value: string) => {
    if (onCellBlur) {
      console.log(`Cell blur event fired at row ${rowIndex}, column ${colIndex}, value: "${value}"`);
      
      toast.loading(`Saving changes...`, { id: `save-${rowIndex}-${colIndex}` });
      
      if (colIndex === 6 || colIndex === 7) {
        try {
          const numValue = parseNumber(value);
          console.log(`Parsed value for blur event: "${value}" -> ${numValue} (parsed as number)`);
          
          // Send the raw number value to the server
          onCellBlur(rowIndex, colIndex, String(numValue));
        } catch (e) {
          console.warn(`Failed to parse number during blur: ${value}`, e);
          onCellBlur(rowIndex, colIndex, value);
        }
      } else {
        onCellBlur(rowIndex, colIndex, value);
      }
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, rowIndex: number, colIndex: number, value: string) => {
    if (e.key === 'Enter' && onCellBlur) {
      console.log(`Enter key pressed at row ${rowIndex}, column ${colIndex}, value: "${value}"`);
      e.preventDefault();
      
      toast.loading(`Saving changes...`, { id: `save-${rowIndex}-${colIndex}` });
      
      if (colIndex === 6 || colIndex === 7) {
        try {
          const numValue = parseNumber(value);
          console.log(`Parsed value for Enter key event: "${value}" -> ${numValue} (parsed as number)`);
          
          // Send the raw number value to the server
          onCellBlur(rowIndex, colIndex, String(numValue));
        } catch (e) {
          console.warn(`Failed to parse number during Enter key press: ${value}`, e);
          onCellBlur(rowIndex, colIndex, value);
        }
      } else {
        onCellBlur(rowIndex, colIndex, value);
      }
      
      (e.target as HTMLElement).blur();
    }
  };

  const columns: ColumnDef<FokusarkRow, any>[] = [
    {
      accessorKey: 'nr',
      header: 'Nr.',
      meta: { frozen: true } as FokusarkColumnMeta,
    },
    {
      accessorKey: 'navn',
      header: 'Navn',
      meta: { frozen: true } as FokusarkColumnMeta,
    },
    {
      accessorKey: 'ansvarlig',
      header: 'Ansvarlig',
    },
    {
      accessorKey: 'tilbud',
      header: 'Tilbud',
      cell: ({ getValue }) => {
        const value = getValue() as string;
        if (!value) return <div className="text-right font-mono"></div>;
        
        const numValue = parseFloat(value.replace(/\./g, '').replace(',', '.'));
        const formatted = !isNaN(numValue) ? formatDanishCurrency(numValue) : value;
        return <div className="text-right font-mono">{formatted}</div>;
      }
    },
    {
      accessorKey: 'montage',
      header: 'Montage',
      cell: ({ getValue }) => {
        const value = getValue() as string;
        if (!value) return <div className="text-right font-mono"></div>;
        
        const numValue = parseFloat(value.replace(/\./g, '').replace(',', '.'));
        const formatted = !isNaN(numValue) ? formatDanishCurrency(numValue) : value;
        return <div className="text-right font-mono">{formatted}</div>;
      }
    },
    {
      accessorKey: 'underleverandor',
      header: 'Underleverandør',
      cell: ({ getValue }) => {
        const value = getValue() as string;
        if (!value) return <div className="text-right font-mono"></div>;
        
        const numValue = parseFloat(value.replace(/\./g, '').replace(',', '.'));
        const formatted = !isNaN(numValue) ? formatDanishCurrency(numValue) : value;
        return <div className="text-right font-mono">{formatted}</div>;
      }
    },
    {
      accessorKey: 'montage2',
      header: 'Montage 2',
      cell: ({ getValue, row, column }) => {
        const value = getValue() as string;
        
        if (!value || value.trim() === '') {
          return <div className="text-right font-mono"></div>;
        }
        
        const numValue = parseNumber(value);
        const rowId = parseInt(row.id);
        const colIndex = 6; // Index of montage2 column
        
        return (
          <div className="flex justify-between">
            <input
              value={value}
              onChange={e => {
                if (onCellChange) {
                  console.log(`Montage2 input changed to: ${e.target.value}`);
                  onCellChange(rowId, colIndex, e.target.value);
                }
                
                const newRows = [...rows];
                newRows[rowId][column.id] = e.target.value;
                setRows(newRows);
              }}
              onBlur={e => {
                console.log(`Montage2 input blur with value: ${e.target.value}`);
                handleInputBlur(rowId, colIndex, e.target.value);
              }}
              onKeyDown={e => {
                console.log(`Montage2 key down: ${e.key}, value: ${e.currentTarget.value}`);
                handleInputKeyDown(e, rowId, colIndex, e.currentTarget.value);
              }}
              className="w-full bg-transparent border-0 focus:ring-1 focus:ring-primary text-right font-mono"
            />
            {numValue > 0 && <div className="text-right font-mono">{formatDanishCurrency(numValue)}</div>}
          </div>
        );
      }
    },
    {
      accessorKey: 'underleverandor2',
      header: 'Underleverandør 2',
      cell: ({ getValue, row, column }) => {
        const value = getValue() as string;
        
        if (!value || value.trim() === '') {
          return <div className="text-right font-mono"></div>;
        }
        
        const numValue = parseNumber(value);
        const rowId = parseInt(row.id);
        const colIndex = 7; // Index of underleverandor2 column
        
        return (
          <div className="flex justify-between">
            <input
              value={value}
              onChange={e => {
                if (onCellChange) {
                  console.log(`Underleverandor2 input changed to: ${e.target.value}`);
                  onCellChange(rowId, colIndex, e.target.value);
                }
                
                const newRows = [...rows];
                newRows[rowId][column.id] = e.target.value;
                setRows(newRows);
              }}
              onBlur={e => {
                console.log(`Underleverandor2 input blur with value: ${e.target.value}`);
                handleInputBlur(rowId, colIndex, e.target.value);
              }}
              onKeyDown={e => {
                console.log(`Underleverandor2 key down: ${e.key}, value: ${e.currentTarget.value}`);
                handleInputKeyDown(e, rowId, colIndex, e.currentTarget.value);
              }}
              className="w-full bg-transparent border-0 focus:ring-1 focus:ring-primary text-right font-mono"
            />
            {numValue > 0 && <div className="text-right font-mono">{formatDanishCurrency(numValue)}</div>}
          </div>
        );
      }
    },
    {
      accessorKey: 'materialer',
      header: 'Materialer',
      cell: ({ getValue }) => {
        const value = getValue() as string;
        if (!value) return <div className="text-right font-mono"></div>;
        
        const numValue = parseFloat(value.replace(/\./g, '').replace(',', '.'));
        const formatted = !isNaN(numValue) ? formatDanishCurrency(numValue) : value;
        return <div className="text-right font-mono">{formatted}</div>;
      }
    },
    {
      accessorKey: 'projektering',
      header: 'Projektering',
      cell: ({ getValue }) => {
        const value = getValue() as string;
        if (!value) return <div className="text-right font-mono"></div>;
        
        const numValue = parseFloat(value.replace(/\./g, '').replace(',', '.'));
        const formatted = !isNaN(numValue) ? formatDanishCurrency(numValue) : value;
        return <div className="text-right font-mono">{formatted}</div>;
      }
    },
    {
      accessorKey: 'produktion',
      header: 'Produktion',
      cell: ({ getValue }) => {
        const value = getValue() as string;
        if (!value) return <div className="text-right font-mono"></div>;
        
        const numValue = parseFloat(value.replace(/\./g, '').replace(',', '.'));
        const formatted = !isNaN(numValue) ? formatDanishCurrency(numValue) : value;
        return <div className="text-right font-mono">{formatted}</div>;
      }
    },
    {
      accessorKey: 'faerdigPctExMontageNu',
      header: 'Færdig % ex montage nu',
      cell: ({ getValue, row, column }) => {
        const value = getValue() as string;
        return (
          <input
            value={value}
            onChange={e => {
              const rowIndex = parseInt(row.id);
              const colKey = column.id;
              const colIndex = 18; // Index of faerdigPctExMontageNu
              onCellChange?.(rowIndex, colIndex, e.target.value);
              
              const newRows = [...rows];
              newRows[rowIndex][colKey] = e.target.value;
              setRows(newRows);
            }}
            onBlur={e => {
              if (onCellBlur) {
                const rowIndex = parseInt(row.id);
                const colIndex = 18; // Index of faerdigPctExMontageNu
                onCellBlur(rowIndex, colIndex, e.target.value);
              }
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && onCellBlur) {
                const rowIndex = parseInt(row.id);
                const colIndex = 18; // Index of faerdigPctExMontageNu
                onCellBlur(rowIndex, colIndex, e.currentTarget.value);
              }
            }}
            className="w-full bg-transparent border-0 focus:ring-1 focus:ring-primary"
          />
        );
      }
    },
    {
      accessorKey: 'faerdigPctExMontageFoer',
      header: 'Færdig % ex montage før',
      cell: ({ getValue, row, column }) => {
        const value = getValue() as string;
        return (
          <input
            value={value}
            onChange={e => {
              const rowIndex = parseInt(row.id);
              const colKey = column.id;
              const colIndex = 19; // Index of faerdigPctExMontageFoer
              onCellChange?.(rowIndex, colIndex, e.target.value);
              
              const newRows = [...rows];
              newRows[rowIndex][colKey] = e.target.value;
              setRows(newRows);
            }}
            onBlur={e => {
              if (onCellBlur) {
                const rowIndex = parseInt(row.id);
                const colIndex = 19; // Index of faerdigPctExMontageFoer
                onCellBlur(rowIndex, colIndex, e.target.value);
              }
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && onCellBlur) {
                const rowIndex = parseInt(row.id);
                const colIndex = 19; // Index of faerdigPctExMontageFoer
                onCellBlur(rowIndex, colIndex, e.currentTarget.value);
              }
            }}
            className="w-full bg-transparent border-0 focus:ring-1 focus:ring-primary"
          />
        );
      }
    }
  ];

  const getColumnOffset = (index: number): number => {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      const columnMeta = columns[i].meta as FokusarkColumnMeta | undefined;
      const isFrozen = columnMeta?.frozen === true;
      if (isFrozen) {
        offset += 150;
      }
    }
    return offset;
  };

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!data || data.length === 0 || rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No data to display</h3>
          <p className="text-muted-foreground">
            Try refreshing the page or using the "Refresh Realized Hours" button.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative border border-border rounded-md fokusark-data-grid" style={{ overflow: 'hidden' }}>
      <div
        className={isDarkMode ? "fokusark-table-container dark" : "fokusark-table-container"}
        style={{
          maxHeight: '70vh',
          width: '100%',
          overflow: 'auto',
        }}
      >
        <Table style={{ width: 'auto', minWidth: '100%' }}>
          <TableHeader>
            <TableRow
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                backgroundColor: 'hsl(var(--background))',
              }}
            >
              {table.getHeaderGroups()[0].headers.map((header, index) => {
                const columnMeta = header.column.columnDef.meta as FokusarkColumnMeta | undefined;
                const isFrozen = columnMeta?.frozen === true;
                const leftOffset = isFrozen ? getColumnOffset(index) : undefined;
                
                return (
                  <TableHead
                    key={header.id}
                    style={{
                      width: '150px',
                      minWidth: '150px',
                      position: isFrozen ? 'sticky' : 'static',
                      left: isFrozen ? `${leftOffset}px` : undefined,
                      zIndex: isFrozen ? 100 : 50,
                      backgroundColor: 'hsl(var(--background))',
                      boxShadow: isFrozen ? '4px 0 4px -2px rgba(0,0,0,0.15)' : undefined,
                      borderRight: isFrozen ? '1px solid hsl(var(--border))' : undefined,
                    }}
                    className="bg-muted/30"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {table.getRowModel().rows.map((row, rowIndex) => {
              const isSubAppointment = row.original.isSubAppointment;
              const isFirstDataRow = rowIndex === 0;
              
              return (
                <TableRow 
                  key={row.id}
                  style={{
                    position: isFirstDataRow ? 'sticky' : 'static',
                    top: '41px',
                    zIndex: isFirstDataRow ? 40 : 30,
                    backgroundColor: isFirstDataRow 
                      ? 'hsl(var(--background))'
                      : undefined,
                  }}
                >
                  {row.getVisibleCells().map((cell, cellIndex) => {
                    const columnMeta = cell.column.columnDef.meta as FokusarkColumnMeta | undefined;
                    const isFrozen = columnMeta?.frozen === true;
                    const leftOffset = isFrozen ? getColumnOffset(cellIndex) : undefined;
                    
                    let zIndex = 30;
                    
                    if (isFrozen && isFirstDataRow) {
                      zIndex = 90;
                    } else if (isFrozen) {
                      zIndex = 80;
                    } else if (isFirstDataRow) {
                      zIndex = 40;
                    }
                    
                    return (
                      <TableCell
                        key={cell.id}
                        style={{
                          width: '150px',
                          minWidth: '150px',
                          position: isFrozen || isFirstDataRow ? 'sticky' : 'static',
                          left: isFrozen ? `${leftOffset}px` : undefined,
                          top: isFrozen && isFirstDataRow ? '41px' : undefined,
                          zIndex,
                          backgroundColor: 'hsl(var(--background))',
                          boxShadow: isFrozen ? '4px 0 4px -2px rgba(0,0,0,0.15)' : undefined,
                          borderRight: isFrozen ? '1px solid hsl(var(--border))' : undefined,
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
    </div>
  );
};

export default FokusarkDataGrid;
