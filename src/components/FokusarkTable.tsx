
import React from "react";
import { useTableData } from "@/hooks/useTableData";
import FokusarkTableLoading from "./fokusark/FokusarkTableLoading";
import MinimalStickyTable from "./fokusark/MinimalStickyTable";

interface FokusarkTableProps {
  data?: string[][];
}

const FokusarkTable: React.FC<FokusarkTableProps> = ({ data }) => {
  const { tableData, isLoading, error, refetchData } = useTableData();
  
  console.log(`FokusarkTable rendering with ${tableData?.length || 0} rows of data`);
  
  // Show loading state while fetching data
  if (isLoading) {
    return <FokusarkTableLoading />;
  }
  
  // Check if we have data to display
  if (!tableData || tableData.length === 0) {
    return (
      <div className="rounded-md w-full relative shadow-md border border-border p-8" style={{ minHeight: '600px' }}>
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No data available</h3>
          <p className="text-muted-foreground mb-4">
            No data source is currently configured.
          </p>
          <button 
            onClick={refetchData}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  // Add detailed debugging information about the data being passed
  console.log("Data passed to MinimalStickyTable:", {
    totalRows: tableData.length,
    firstRowData: tableData.length > 0 ? tableData[0].slice(0, 5) : [],
    lastRowData: tableData.length > 0 ? tableData[tableData.length - 1].slice(0, 5) : []
  });

  return (
    <div className="rounded-md w-full relative" style={{ minHeight: '600px' }}>
      <MinimalStickyTable tableData={tableData} />
    </div>
  );
};

export default FokusarkTable;
