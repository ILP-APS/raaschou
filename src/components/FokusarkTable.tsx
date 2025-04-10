
import React, { useEffect } from "react";
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
  const { isLoading, refreshData, tableData: hookData } = useFokusarkData();
  
  // Use both sources of data - either passed in props or from the hook
  const displayData = data && data.length > 0 ? data : hookData;
  
  // Add more detailed logging for debugging
  useEffect(() => {
    console.log("FokusarkTable component state:", {
      isLoading,
      propsDataLength: data?.length || 0,
      hookDataLength: hookData?.length || 0,
      displayDataLength: displayData?.length || 0,
      firstRowFromProps: data && data.length > 0 ? data[0].slice(0, 3) : 'No data from props',
      firstRowFromHook: hookData && hookData.length > 0 ? hookData[0].slice(0, 3) : 'No data from hook',
    });
  }, [data, hookData, isLoading, displayData]);
  
  // Show loading state while fetching data
  if (isLoading) {
    return <FokusarkTableLoading />;
  }
  
  // Check if we have data to display
  if (!displayData || displayData.length === 0) {
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
      <MinimalStickyTable tableData={displayData} />
    </div>
  );
};

export default FokusarkTable;
