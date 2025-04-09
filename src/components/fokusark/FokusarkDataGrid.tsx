
import React, { useState, useCallback, useEffect } from "react";
import DataGrid, { SortColumn } from "react-data-grid";
import "./styles/dataGridStyles.css";
import { useTheme } from "next-themes";
import { transformDataToRows, FokusarkRow } from "./utils/dataGridUtils";
import { getColumns } from "./components/ColumnDefinitions";
import SubAppointmentRow from "./components/SubAppointmentRow";

// Define props for our component
interface FokusarkDataGridProps {
  data: string[][];
  onCellChange?: (rowIndex: number, colIndex: number, value: string) => void;
}

const FokusarkDataGrid: React.FC<FokusarkDataGridProps> = ({ data, onCellChange }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  
  // State for sorting
  const [sortColumns, setSortColumns] = useState<SortColumn[]>([]);
  const [rows, setRows] = useState<FokusarkRow[]>([]);

  // Update rows when data changes
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

  // Handle cell value changes
  const handleCellChange = useCallback((rowIndex: number, columnKey: string, value: string) => {
    // Find the column index based on the column key
    const columns = getColumns();
    const colIndex = columns.findIndex(col => col.key === columnKey);
    if (colIndex >= 0) {
      onCellChange?.(rowIndex, colIndex, value);
    }
  }, [onCellChange]);

  return (
    <div className="fokusark-data-grid">
      {rows.length > 0 ? (
        <DataGrid
          className={isDarkMode ? "rdg-dark" : ""}
          columns={getColumns()}
          rows={rows}
          rowRenderer={SubAppointmentRow}
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
          enableVirtualization
        />
      ) : (
        <div className="flex items-center justify-center h-64 w-full">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">No data to display</h3>
            <p className="text-muted-foreground">
              Try refreshing the page or using the "Refresh Realized Hours" button.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FokusarkDataGrid;
