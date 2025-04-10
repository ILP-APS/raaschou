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

// Define custom meta type for columns
interface FokusarkColumnMeta {
  frozen?: boolean;
}

// Define the row type for our grid
interface FokusarkRow {
  [key: string]: string | number | boolean;
  id: string;
  isSubAppointment?: boolean;
}

// Define props for our component
interface FokusarkDataGridProps {
  data: string[][];
  onCellChange?: (rowIndex: number, colIndex: number, value: string) => void;
}

const FokusarkDataGrid: React.FC<FokusarkDataGridProps> = ({ data, onCellChange }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [rows, setRows] = useState<FokusarkRow[]>([]);

  // Transform raw data to grid rows on data change
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

  // Define columns
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
        return <div className="text-right font-mono">kr. {value}</div>;
      }
    },
    {
      accessorKey: 'montage',
      header: 'Montage',
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return <div className="text-right font-mono">kr. {value}</div>;
      }
    },
    {
      accessorKey: 'underleverandor',
      header: 'Underleverandør',
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return <div className="text-right font-mono">kr. {value}</div>;
      }
    },
    {
      accessorKey: 'montage2',
      header: 'Montage 2',
      cell: ({ getValue, row, column, table }) => {
        const value = getValue() as string;
        return (
          <input
            value={value}
            onChange={e => {
              const rowIndex = parseInt(row.id);
              const colKey = column.id;
              const colIndex = 6; // Index of montage2 column
              onCellChange?.(rowIndex, colIndex, e.target.value);
              
              // Update the internal state
              const newRows = [...rows];
              newRows[rowIndex][colKey] = e.target.value;
              setRows(newRows);
            }}
            className="w-full bg-transparent border-0 focus:ring-1 focus:ring-primary"
          />
        );
      }
    },
    {
      accessorKey: 'underleverandor2',
      header: 'Underleverandør 2',
      cell: ({ getValue, row, column }) => {
        const value = getValue() as string;
        return (
          <input
            value={value}
            onChange={e => {
              const rowIndex = parseInt(row.id);
              const colKey = column.id;
              const colIndex = 7; // Index of underleverandor2 column
              onCellChange?.(rowIndex, colIndex, e.target.value);
              
              // Update the internal state
              const newRows = [...rows];
              newRows[rowIndex][colKey] = e.target.value;
              setRows(newRows);
            }}
            className="w-full bg-transparent border-0 focus:ring-1 focus:ring-primary"
          />
        );
      }
    },
    {
      accessorKey: 'materialer',
      header: 'Materialer',
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return <div className="text-right font-mono">kr. {value}</div>;
      }
    },
    {
      accessorKey: 'projektering',
      header: 'Projektering',
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return <div className="text-right font-mono">kr. {value}</div>;
      }
    },
    {
      accessorKey: 'produktion',
      header: 'Produktion',
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return <div className="text-right font-mono">kr. {value}</div>;
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
              
              // Update the internal state
              const newRows = [...rows];
              newRows[rowIndex][colKey] = e.target.value;
              setRows(newRows);
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
              
              // Update the internal state
              const newRows = [...rows];
              newRows[rowIndex][colKey] = e.target.value;
              setRows(newRows);
            }}
            className="w-full bg-transparent border-0 focus:ring-1 focus:ring-primary"
          />
        );
      }
    }
  ];

  // Helper to calculate column offsets
  const getColumnOffset = (index: number): number => {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      const columnMeta = columns[i].meta as FokusarkColumnMeta | undefined;
      const isFrozen = columnMeta?.frozen === true;
      if (isFrozen) {
        offset += 150; // Fixed column width
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
                      zIndex: isFrozen ? 100 : 50, // Increased z-index for frozen columns
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
              // Make the first row sticky
              const isFirstDataRow = rowIndex === 0;
              
              return (
                <TableRow 
                  key={row.id}
                  className={isSubAppointment ? "bg-muted/20" : ""}
                  style={{
                    position: isFirstDataRow ? 'sticky' : 'static',
                    top: '41px', // Height of the header row
                    zIndex: isFirstDataRow ? 40 : 30,
                    backgroundColor: isFirstDataRow 
                      ? (isSubAppointment ? 'hsl(var(--muted)/20)' : 'hsl(var(--background))')
                      : undefined,
                  }}
                >
                  {row.getVisibleCells().map((cell, cellIndex) => {
                    const columnMeta = cell.column.columnDef.meta as FokusarkColumnMeta | undefined;
                    const isFrozen = columnMeta?.frozen === true;
                    const leftOffset = isFrozen ? getColumnOffset(cellIndex) : undefined;
                    
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
                          width: '150px',
                          minWidth: '150px',
                          position: isFrozen || isFirstDataRow ? 'sticky' : 'static',
                          left: isFrozen ? `${leftOffset}px` : undefined,
                          top: isFrozen && isFirstDataRow ? '41px' : undefined, // For first row frozen cells
                          zIndex,
                          backgroundColor: isSubAppointment ? 'hsl(var(--muted)/20)' : 'hsl(var(--background))',
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
