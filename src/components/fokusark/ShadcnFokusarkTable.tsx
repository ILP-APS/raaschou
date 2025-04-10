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
import { formatDanishCurrency } from '@/utils/formatUtils';

// Define custom meta type for columns
type FokusarkColumnMeta = {
  frozen?: boolean;
  width?: number;
  alignment?: 'left' | 'right' | 'center';
  format?: 'currency' | 'number' | 'text';
};

// Define the row type for our grid
interface FokusarkRow {
  [key: string]: any;
  id: string;
  isSubAppointment?: boolean;
}

// Define props for our component
interface ShadcnFokusarkTableProps {
  data: string[][];
  onCellChange?: (rowIndex: number, colIndex: number, value: string) => void;
}

const ShadcnFokusarkTable: React.FC<ShadcnFokusarkTableProps> = ({ data, onCellChange }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [rows, setRows] = useState<FokusarkRow[]>([]);

  // Transform raw data to grid rows on data change
  useEffect(() => {
    console.log("ShadcnFokusarkTable received data:", data?.length || 0, "rows");
    if (data && data.length > 0) {
      const transformedRows = transformDataToRows(data);
      console.log("Transformed to", transformedRows.length, "grid rows");
      setRows(transformedRows);
    } else {
      console.log("No data to transform");
      setRows([]);
    }
  }, [data]);

  // Function to transform string[][] data into row objects for the grid
  const transformDataToRows = (rawData: string[][]): FokusarkRow[] => {
    return (rawData || []).map((row, index) => {
      const rowObj: FokusarkRow = { id: index.toString() };
      
      // The last element might indicate if it's a sub-appointment
      const rowType = row.length > 0 ? row[row.length - 1] : null;
      rowObj.isSubAppointment = rowType === 'sub-appointment';
      
      // Map the columns to the rowObj
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

  // Format values based on column type
  const formatValue = (value: string, format?: string) => {
    if (!value) return '';
    
    if (format === 'currency') {
      // Use our Danish currency formatter for monetary values
      const numericValue = parseFloat(value.replace(/\./g, '').replace(',', '.'));
      return (
        <div className="text-right font-mono">
          {!isNaN(numericValue) ? formatDanishCurrency(numericValue) : value}
        </div>
      );
    }
    
    return value;
  };

  // Define columns
  const columns: ColumnDef<FokusarkRow, unknown>[] = [
    {
      accessorKey: 'nr',
      header: 'Nr.',
      meta: { frozen: true, width: 100 } as FokusarkColumnMeta,
    },
    {
      accessorKey: 'navn',
      header: 'Navn',
      meta: { frozen: true, width: 180 } as FokusarkColumnMeta,
    },
    {
      accessorKey: 'ansvarlig',
      header: 'Ansvarlig',
      meta: { width: 120 } as FokusarkColumnMeta,
    },
    {
      accessorKey: 'tilbud',
      header: 'Tilbud',
      meta: { width: 140, format: 'currency', alignment: 'right' } as FokusarkColumnMeta,
      cell: ({ getValue }) => formatValue(getValue() as string, 'currency'),
    },
    {
      accessorKey: 'montage',
      header: 'Montage',
      meta: { width: 140, format: 'currency', alignment: 'right' } as FokusarkColumnMeta,
      cell: ({ getValue }) => formatValue(getValue() as string, 'currency'),
    },
    {
      accessorKey: 'underleverandor',
      header: 'Underleverandør',
      meta: { width: 140, format: 'currency', alignment: 'right' } as FokusarkColumnMeta,
      cell: ({ getValue }) => formatValue(getValue() as string, 'currency'),
    },
    {
      accessorKey: 'materialer',
      header: 'Materialer',
      meta: { width: 140, format: 'currency', alignment: 'right' } as FokusarkColumnMeta,
      cell: ({ getValue }) => formatValue(getValue() as string, 'currency'),
    },
    {
      accessorKey: 'projektering',
      header: 'Projektering',
      meta: { width: 140, format: 'currency', alignment: 'right' } as FokusarkColumnMeta,
      cell: ({ getValue }) => formatValue(getValue() as string, 'currency'),
    },
    {
      accessorKey: 'column1',
      header: 'Column 1',
      meta: { width: 120 } as FokusarkColumnMeta,
    },
    {
      accessorKey: 'column2',
      header: 'Column 2',
      meta: { width: 120 } as FokusarkColumnMeta,
    },
    {
      accessorKey: 'column3',
      header: 'Column 3',
      meta: { width: 120 } as FokusarkColumnMeta,
    }
  ];

  // Helper to calculate column offsets
  const getColumnOffset = (index: number): number => {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      const colMeta = columns[i].meta as FokusarkColumnMeta;
      const isFrozen = !!colMeta?.frozen;
      if (isFrozen) {
        offset += (colMeta?.width || 150); // Use column width or default to 150px
      }
    }
    return offset;
  };

  // Create the table instance
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
            {/* Sticky header row */}
            <TableRow
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                backgroundColor: 'hsl(var(--background))',
              }}
            >
              {table.getHeaderGroups()[0].headers.map((header, index) => {
                const colMeta = header.column.columnDef.meta as FokusarkColumnMeta;
                const isFrozen = !!colMeta?.frozen;
                const leftOffset = isFrozen ? getColumnOffset(index) : undefined;
                const width = colMeta?.width || 150;
                
                return (
                  <TableHead
                    key={header.id}
                    style={{
                      width: `${width}px`,
                      minWidth: `${width}px`,
                      position: isFrozen ? 'sticky' : 'static',
                      left: isFrozen ? `${leftOffset}px` : undefined,
                      zIndex: isFrozen ? 100 : 50, // Increased z-index for frozen columns
                      backgroundColor: 'hsl(var(--muted)/50)',
                      boxShadow: isFrozen ? '4px 0 4px -2px rgba(0,0,0,0.15)' : undefined,
                      borderRight: isFrozen ? '1px solid hsl(var(--border))' : undefined,
                      textAlign: colMeta?.alignment || 'left',
                    }}
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
              // Make the first row stick to the top (row below header)
              const isFirstDataRow = rowIndex === 0;
              
              return (
                <TableRow 
                  key={row.id}
                  // Removed the background class for sub-appointments
                  style={{
                    position: isFirstDataRow ? 'sticky' : 'static',
                    top: isFirstDataRow ? '41px' : undefined,
                    zIndex: isFirstDataRow ? 40 : 30,
                    backgroundColor: isFirstDataRow 
                      ? 'hsl(var(--background))'
                      : undefined,
                  }}
                >
                  {row.getVisibleCells().map((cell, cellIndex) => {
                    const colMeta = cell.column.columnDef.meta as FokusarkColumnMeta;
                    const isFrozen = !!colMeta?.frozen;
                    const leftOffset = isFrozen ? getColumnOffset(cellIndex) : undefined;
                    const width = colMeta?.width || 150;
                    
                    // Determine z-index based on both sticky position and frozen status
                    let zIndex = 30; // Default z-index
                    
                    if (isFrozen && isFirstDataRow) {
                      zIndex = 90; // Highest z-index for frozen cells in the first row
                    } else if (isFrozen) {
                      zIndex = 80; // High z-index for frozen cells in other rows
                    } else if (isFirstDataRow) {
                      zIndex = 40; // Higher z-index for non-frozen cells in the first row
                    }
                    
                    return (
                      <TableCell
                        key={cell.id}
                        style={{
                          width: `${width}px`,
                          minWidth: `${width}px`,
                          position: isFrozen || isFirstDataRow ? 'sticky' : 'static',
                          left: isFrozen ? `${leftOffset}px` : undefined,
                          top: isFrozen && isFirstDataRow ? '41px' : undefined, // For first row frozen cells
                          zIndex,
                          backgroundColor: 'hsl(var(--background))', // Use standard background for all cells
                          boxShadow: isFrozen ? '4px 0 4px -2px rgba(0,0,0,0.15)' : undefined,
                          borderRight: isFrozen ? '1px solid hsl(var(--border))' : undefined,
                          textAlign: colMeta?.alignment || 'left',
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

export default ShadcnFokusarkTable;
