
import React, { useEffect } from "react";
import FokusarkDataGrid from "./fokusark/FokusarkDataGrid";
import FokusarkTableLoading from "./fokusark/FokusarkTableLoading";
import { useFokusarkTable } from "@/hooks/useFokusarkTable";

interface FokusarkTableProps {
  data: string[][];
}

const FokusarkTable: React.FC<FokusarkTableProps> = ({ data }) => {
  const { tableData, isLoading, handleCellChange } = useFokusarkTable(data);
  
  // Debug logs to track data flow
  useEffect(() => {
    console.log("FokusarkTable received data:", data);
    console.log("FokusarkTable processed data:", tableData);
  }, [data, tableData]);
  
  // Show loading state while fetching data
  if (isLoading) {
    return <FokusarkTableLoading />;
  }
  
  // Check if we have data to display
  if (!tableData || tableData.length === 0) {
    return (
      <div className="rounded-md w-full relative shadow-md border border-border p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No data available</h3>
          <p className="text-muted-foreground">
            Try refreshing the page or using the "Refresh Realized Hours" button.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md w-full relative shadow-md border border-border">
      <FokusarkDataGrid 
        data={tableData}
        onCellChange={handleCellChange}
      />
    </div>
  );
};

export default FokusarkTable;
