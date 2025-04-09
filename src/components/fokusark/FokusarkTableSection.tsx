
import React from "react";
import FokusarkDataGrid from "./FokusarkDataGrid";
import { useFokusarkTable } from "@/hooks/useFokusarkTable";

interface FokusarkTableSectionProps {
  tableData: string[][];
  isLoading: boolean;
}

const FokusarkTableSection: React.FC<FokusarkTableSectionProps> = ({ 
  tableData, 
  isLoading 
}) => {
  const { handleCellChange } = useFokusarkTable(tableData);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="fokusark-table-container">
      <FokusarkDataGrid 
        data={tableData}
        onCellChange={handleCellChange}
      />
    </div>
  );
};

export default FokusarkTableSection;
