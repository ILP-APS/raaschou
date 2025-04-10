
import React from "react";
import { useFokusarkTable } from "@/hooks/useFokusarkTable";
import FokusarkTableLoading from "./fokusark/FokusarkTableLoading";
import MinimalStickyTable from "./fokusark/MinimalStickyTable";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface FokusarkTableProps {
  data: string[][];
}

const FokusarkTable: React.FC<FokusarkTableProps> = ({ data }) => {
  const { tableData, isLoading, error, refreshData, handleCellChange } = useFokusarkTable(data);
  
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
            Try refreshing the page or using the "Refresh Data" button.
          </p>
          <Button 
            onClick={refreshData}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>
    );
  }

  // If we have an error but also have data (fallback data), show a warning toast
  if (error && tableData.length > 0) {
    console.warn("Displaying fallback data due to an error:", error);
  }

  // Add detailed debugging information about the data being passed
  console.log("Data passed to MinimalStickyTable:", {
    totalRows: tableData.length,
    firstRowData: tableData.length > 0 ? tableData[0].slice(0, 5) : [],
    lastRowData: tableData.length > 0 ? tableData[tableData.length - 1].slice(0, 5) : []
  });

  return (
    <div className="rounded-md w-full relative" style={{ minHeight: '600px' }}>
      <MinimalStickyTable tableData={tableData} onCellChange={handleCellChange} />
      <div className="mt-4 flex justify-end">
        <Button 
          onClick={refreshData}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
      </div>
    </div>
  );
};

export default FokusarkTable;
