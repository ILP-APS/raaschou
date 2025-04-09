
import React from "react";
import FokusarkDataGrid from "./fokusark/FokusarkDataGrid";
import FokusarkTableLoading from "./fokusark/FokusarkTableLoading";
import { useFokusarkTable } from "@/hooks/useFokusarkTable";

interface FokusarkTableProps {
  data: string[][];
}

const FokusarkTable: React.FC<FokusarkTableProps> = ({ data }) => {
  const { tableData, isLoading, handleCellChange } = useFokusarkTable(data);
  
  // Show loading state while fetching data
  if (isLoading) {
    return <FokusarkTableLoading />;
  }

  return (
    <div className="rounded-md w-full relative shadow-sm">
      <FokusarkDataGrid 
        data={tableData}
        onCellChange={handleCellChange}
      />
    </div>
  );
};

export default FokusarkTable;
