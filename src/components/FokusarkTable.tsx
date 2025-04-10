
import React from "react";
import { useFokusarkData } from "@/hooks/useFokusarkData";
import FokusarkTableLoading from "./fokusark/FokusarkTableLoading";
import MinimalStickyTable from "./fokusark/MinimalStickyTable";

interface FokusarkTableProps {
  data: string[][];
}

const FokusarkTable: React.FC<FokusarkTableProps> = ({ data }) => {
  const { isLoading, error, refreshData } = useFokusarkData();
  
  console.log(`FokusarkTable rendering with ${data?.length || 0} rows of data`);
  
  // Show loading state while fetching data
  if (isLoading) {
    return <FokusarkTableLoading />;
  }
  
  // Check if we have data to display
  if (!data || data.length === 0) {
    return (
      <div className="rounded-md w-full relative shadow-md border border-border p-8" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No data available</h3>
          <p className="text-muted-foreground mb-4">
            Try refreshing the page or using the "Refresh Realized Hours" button.
          </p>
          <button 
            onClick={refreshData}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  // If we have an error but also have data (fallback data), show a warning toast
  if (error && data.length > 0) {
    console.warn("Displaying fallback data due to an error:", error);
  }

  return (
    <div className="rounded-md w-full relative">
      <MinimalStickyTable tableData={data} />
    </div>
  );
};

export default FokusarkTable;
