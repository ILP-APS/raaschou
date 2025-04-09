
import React, { useState, useEffect } from "react";
import DataGrid from "react-data-grid";
import "./styles/dataGridStyles.css";
import { useTheme } from "next-themes";
import { transformDataToRows } from "./utils/dataGridUtils";
import { getColumns } from "./components/ColumnDefinitions";

// Define props for our component
interface FokusarkDataGridProps {
  data: string[][];
  onCellChange?: (rowIndex: number, colIndex: number, value: string) => void;
}

const FokusarkDataGrid: React.FC<FokusarkDataGridProps> = ({ data, onCellChange }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  
  const [rows, setRows] = useState([]);

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

  // Handler for cell changes
  const handleRowsChange = (newRows, { indexes, column }) => {
    setRows(newRows);
    if (column && indexes.length === 1) {
      const rowIndex = indexes[0];
      const columnKey = column.key;
      // Find the column index based on the column key
      const columns = getColumns();
      const colIndex = columns.findIndex(col => col.key === columnKey);
      if (colIndex >= 0) {
        onCellChange?.(rowIndex, colIndex, String(newRows[rowIndex][columnKey]));
      }
    }
  };

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
    <div className="fokusark-data-grid h-[70vh]">
      <DataGrid
        className={isDarkMode ? "rdg-dark" : ""}
        columns={getColumns()}
        rows={rows}
        rowHeight={48}
        headerRowHeight={41}
        onRowsChange={handleRowsChange}
        enableVirtualization
      />
    </div>
  );
};

export default FokusarkDataGrid;
