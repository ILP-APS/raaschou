
import React, { useState, useCallback } from "react";
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
  const [rows, setRows] = useState<FokusarkRow[]>(transformDataToRows(data));

  // Update rows when data changes
  React.useEffect(() => {
    setRows(transformDataToRows(data));
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
    </div>
  );
};

export default FokusarkDataGrid;
