
import React from "react";
import DataGrid from "react-data-grid";

interface FokusarkDataGridProps {
  data: any[];
  columns: any[];
  onCellUpdate?: (rowIndex: number, columnKey: string, value: any) => void;
}

const FokusarkDataGrid: React.FC<FokusarkDataGridProps> = ({ data, columns, onCellUpdate }) => {
  return (
    <div className="w-full h-96 border rounded-lg">
      <DataGrid columns={columns} rows={data} className="rdg-light" />
    </div>
  );
};

export default FokusarkDataGrid;
