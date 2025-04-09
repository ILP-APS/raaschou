
import React from "react";
import { useFokusarkData } from "@/hooks/useFokusarkData";
import FokusarkTableLoading from "./fokusark/FokusarkTableLoading";

interface FokusarkTableProps {
  data: string[][];
}

const FokusarkTable: React.FC<FokusarkTableProps> = ({ data }) => {
  const { isLoading, refreshData } = useFokusarkData();
  
  // Show loading state while fetching data
  if (isLoading) {
    return <FokusarkTableLoading />;
  }
  
  // Check if we have data to display
  if (!data || data.length === 0) {
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
    <div className="rounded-md w-full relative">
      <div className="text-center p-8">
        <p>Table implementation removed.</p>
      </div>
    </div>
  );
};

export default FokusarkTable;
