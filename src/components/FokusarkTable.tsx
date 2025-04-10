
import React from "react";
import { useFokusarkData } from "@/hooks/useFokusarkData";
import FokusarkTableLoading from "./fokusark/FokusarkTableLoading";
import MinimalStickyTable from "./fokusark/MinimalStickyTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FokusarkTableProps {
  data: string[][];
}

const FokusarkTable: React.FC<FokusarkTableProps> = ({ data }) => {
  const { isLoading, refreshData } = useFokusarkData();
  
  console.log("FokusarkTable rendering with data:", {
    isLoading,
    dataLength: data?.length || 0,
    firstRow: data && data.length > 0 ? data[0] : 'No data'
  });
  
  // Show loading state while fetching data
  if (isLoading) {
    return <FokusarkTableLoading />;
  }
  
  // Check if we have data to display
  if (!data || data.length === 0) {
    return (
      <div className="rounded-md w-full relative shadow-md border border-border p-8">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No data available</AlertTitle>
          <AlertDescription>
            No appointment data could be loaded. Try refreshing the data.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button 
            onClick={() => refreshData && refreshData()} 
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md w-full relative">
      <MinimalStickyTable tableData={data} />
    </div>
  );
};

export default FokusarkTable;
