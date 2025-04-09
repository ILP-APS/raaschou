
import React, { useState, useCallback } from "react";
import DataGrid, { Column, SortColumn } from "react-data-grid";
import "react-data-grid/lib/styles.css";
import "./FokusarkDataGridStyles.css";
import { useTheme } from "next-themes";

// Define the row type for our grid
interface FokusarkRow {
  [key: string]: string | number | boolean;
  isSubAppointment?: boolean;
}

interface FokusarkDataGridProps {
  data: string[][];
  onCellChange?: (rowIndex: number, colIndex: number, value: string) => void;
}

const FokusarkDataGrid: React.FC<FokusarkDataGridProps> = ({ data, onCellChange }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  
  // State for sorting
  const [sortColumns, setSortColumns] = useState<SortColumn[]>([]);
  const [rows, setRows] = useState<FokusarkRow[]>(transformDataToRows(data));

  // Transform string[][] data into row objects for the grid
  function transformDataToRows(rawData: string[][]): FokusarkRow[] {
    return rawData.map((row, index) => {
      const rowObj: FokusarkRow = { id: index.toString() };
      
      // The last element in the raw data indicates if it's a sub-appointment
      const rowType = row[row.length - 1];
      rowObj.isSubAppointment = rowType === 'sub-appointment';
      
      // Map the columns to the rowObj
      const columnNames = getColumnNames();
      for (let i = 0; i < Math.min(row.length - 1, columnNames.length); i++) {
        rowObj[columnNames[i].key] = row[i];
      }
      
      return rowObj;
    });
  }

  // Update rows when data changes
  React.useEffect(() => {
    setRows(transformDataToRows(data));
  }, [data]);

  // Handle cell value changes
  const handleCellChange = useCallback((rowIndex: number, columnKey: string, value: string) => {
    // Find the column index based on the column key
    const colIndex = columns.findIndex(col => col.key === columnKey);
    if (colIndex >= 0) {
      onCellChange?.(rowIndex, colIndex, value);
    }
  }, [onCellChange]);

  // Define whether a column is editable
  const isColumnEditable = (columnKey: string): boolean => {
    // Only these columns are editable: Montage 2, Underleverandør 2, Færdig % ex montage nu/før
    return ["montage2", "underleverandor2", "faerdig_pct_ex_montage_nu", "faerdig_pct_ex_montage_foer"].includes(columnKey);
  };

  // Get column names and configuration
  function getColumnNames(): Column<FokusarkRow, any>[] {
    return [
      { key: "nr", name: "Nr.", frozen: true, width: 80 },
      { key: "navn", name: "Navn", frozen: true, width: 250 },
      { key: "ansvarlig", name: "Ansvarlig", width: 120 },
      { key: "tilbud", name: "Tilbud", width: 120 },
      { key: "montage", name: "Montage", width: 120 },
      { key: "underleverandor", name: "Underleverandør", width: 120 },
      { key: "montage2", name: "Montage 2", width: 120, 
        editor: props => (
          <input
            value={props.row[props.column.key] as string}
            onChange={e => props.onRowChange({ ...props.row, [props.column.key]: e.target.value })}
            className="w-full h-full px-2 bg-transparent"
          />
        )
      },
      { key: "underleverandor2", name: "Underleverandør 2", width: 120,
        editor: props => (
          <input
            value={props.row[props.column.key] as string}
            onChange={e => props.onRowChange({ ...props.row, [props.column.key]: e.target.value })}
            className="w-full h-full px-2 bg-transparent"
          />
        )
      },
      { key: "materialer", name: "Materialer", width: 120 },
      { key: "projektering", name: "Projektering", width: 120 },
      { key: "produktion", name: "Produktion", width: 120 },
      { key: "montage_3", name: "Montage", width: 120 },
      { key: "projektering_2", name: "Projektering", width: 120 },
      { key: "produktion_realized", name: "Produktion", width: 120 },
      { key: "montage_3_realized", name: "Montage", width: 120 },
      { key: "total", name: "Total", width: 120 },
      { key: "timer_tilbage_1", name: "Projektering", width: 120 },
      { key: "timer_tilbage_2", name: "Timer tilbage", width: 120 },
      { key: "faerdig_pct_ex_montage_nu", name: "Færdig % ex montage nu", width: 160,
        editor: props => (
          <input
            value={props.row[props.column.key] as string}
            onChange={e => props.onRowChange({ ...props.row, [props.column.key]: e.target.value })}
            className="w-full h-full px-2 bg-transparent"
          />
        )
      },
      { key: "faerdig_pct_ex_montage_foer", name: "Færdig % ex montage før", width: 160,
        editor: props => (
          <input
            value={props.row[props.column.key] as string}
            onChange={e => props.onRowChange({ ...props.row, [props.column.key]: e.target.value })}
            className="w-full h-full px-2 bg-transparent"
          />
        )
      },
      { key: "est_timer_ift_faerdig_pct", name: "Est timer ift færdig %", width: 150 },
      { key: "plus_minus_timer", name: "+/- timer", width: 120 },
      { key: "afsat_fragt", name: "Afsat fragt", width: 120 }
    ];
  }

  // Column groups for the header
  const columnGroups = [
    { name: "Aftale", columns: ["nr", "navn"] },
    { name: "Ansvarlig", columns: ["ansvarlig"] },
    { name: "TILBUD", columns: ["tilbud", "montage", "underleverandor", "montage2", "underleverandor2"] },
    { name: "Estimeret", columns: ["materialer", "projektering", "produktion", "montage_3"] },
    { name: "Realiseret", columns: ["projektering_2", "produktion_realized", "montage_3_realized", "total"] },
    { name: "Timer tilbage", columns: ["timer_tilbage_1"] },
    { name: "Produktion", columns: ["timer_tilbage_2", "faerdig_pct_ex_montage_nu", "faerdig_pct_ex_montage_foer", "est_timer_ift_faerdig_pct", "plus_minus_timer"] },
    { name: "Transport", columns: ["afsat_fragt"] }
  ];

  // Define columns for the grid
  const columns = getColumnNames();

  // Row renderer to apply special styling for sub-appointments
  const rowRenderer = useCallback(props => {
    const isSubAppointment = props.row.isSubAppointment;
    return (
      <div
        {...props}
        className={`rdg-row ${isSubAppointment ? 'bg-muted/20' : ''} ${props.className}`}
        style={{
          ...props.style,
          paddingLeft: isSubAppointment ? '20px' : undefined
        }}
      />
    );
  }, []);

  return (
    <div className="fokusark-data-grid">
      <style jsx>{`
        .fokusark-data-grid {
          height: calc(100vh - 220px);
          width: 100%;
          border: 1px solid hsl(var(--border));
          border-radius: 0.5rem;
        }
        
        :global(.rdg) {
          border-radius: 0.5rem;
          border: none;
          height: 100%;
        }
        
        :global(.rdg-header-row) {
          background-color: hsl(var(--background));
        }
        
        :global(.rdg-cell) {
          border-right: 1px solid hsl(var(--border));
          border-bottom: 1px solid hsl(var(--border));
        }
        
        :global(.rdg-row:hover) {
          background-color: hsl(var(--muted)/50);
        }
        
        :global(.rdg-row[aria-selected=true]) {
          background-color: hsl(var(--muted)/30);
        }
      `}</style>
      
      <DataGrid
        className={isDarkMode ? "rdg-dark" : ""}
        columns={columns}
        rows={rows}
        rowRenderer={rowRenderer}
        rowHeight={48}
        headerRowHeight={41}
        sortColumns={sortColumns}
        onSortColumnsChange={setSortColumns}
        onRowsChange={(updatedRows, { indexes, column }) => {
          setRows(updatedRows);
          if (column && indexes.length === 1) {
            const rowIndex = indexes[0];
            const columnKey = column.key;
            handleCellChange(rowIndex, columnKey, String(updatedRows[rowIndex][columnKey]));
          }
        }}
      />
    </div>
  );
};

export default FokusarkDataGrid;
