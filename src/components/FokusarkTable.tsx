
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
  
  if (isLoading) {
    return (
      <div className="rounded-md w-full relative shadow-md border border-border p-8" style={{ minHeight: '600px' }}>
        <div className="flex flex-col items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading appointment data from API...</p>
        </div>
      </div>
    );
  }
  
  if (!tableData || tableData.length === 0) {
    return (
      <div className="rounded-md w-full relative shadow-md border border-border p-8" style={{ minHeight: '600px' }}>
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No data available from API</h3>
          <p className="text-muted-foreground mb-4">
            Unable to fetch real appointment data. Try refreshing the data.
          </p>
          <Button 
            onClick={refreshData}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data from API
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md w-full relative shadow-md border border-border p-8" style={{ minHeight: '600px' }}>
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2 text-destructive">Error Loading Data</h3>
          <p className="text-muted-foreground mb-4">
            {error.message || "An error occurred while fetching data from the API."}
          </p>
          <Button 
            onClick={refreshData}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md w-full relative" style={{ minHeight: '600px' }}>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            {tableData.length === 1 ? 
              `Showing 1 appointment from API` : 
              `Showing ${tableData.length} appointments from API`}
          </p>
        </div>
        <Button 
          onClick={refreshData}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Data from API
        </Button>
      </div>
      
      <MinimalStickyTable tableData={tableData} onCellChange={handleCellChange} />
    </div>
  );
};

export default FokusarkTable;
