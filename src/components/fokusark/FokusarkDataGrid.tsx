
import React from "react";
import DataGrid from "react-data-grid";
import { Button } from "@/components/ui/button";

interface FokusarkDataGridProps {
  data: any[];
  columns: any[];
  onCellUpdate?: (rowIndex: number, columnKey: string, value: any) => void;
}

const FokusarkDataGrid: React.FC<FokusarkDataGridProps> = ({ 
  data, 
  columns, 
  onCellUpdate 
}) => {
  const handleCellChange = (row: any, column: any, value: any) => {
    if (onCellUpdate) {
      const rowIndex = data.findIndex(r => r === row);
      onCellUpdate(rowIndex, column.key, value);
    }
  };

  return (
    <div className="w-full h-96 border rounded-lg">
      <DataGrid
        columns={columns}
        rows={data}
        className="rdg-light"
      />
    </div>
  );
};

export default FokusarkDataGrid;
