
import React, { useState } from "react";
import FokusarkDescription from "./FokusarkDescription";
import MinimalStickyTable from "./MinimalStickyTable";
import { useFokusarkTable } from "@/hooks/useFokusarkTable";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const FokusarkContent: React.FC = () => {
  const { isLoading, tableData, isInitialized, handleCellChange, refreshData, error } = useFokusarkTable([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };
  
  if (isLoading && !isInitialized) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <div className="flex flex-col gap-4 pb-4">
          <h2 className="text-2xl font-semibold tracking-tight">Fokusark</h2>
          <FokusarkDescription />
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-4 pb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Fokusark</h2>
        <FokusarkDescription />
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>API Error</AlertTitle>
            <AlertDescription>
              Unable to fetch data from the API ({error.message}). Sample data is being displayed instead.
              {!error.message.includes("401") ? "" : " Check your API key credentials."}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-end gap-2">
          <Button 
            onClick={handleRefresh}
            className="gap-2"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isRefreshing ? 'Refreshing...' : 'Refresh Data from API'}
          </Button>
        </div>
      </div>
      
      <MinimalStickyTable 
        tableData={tableData} 
        onCellChange={handleCellChange}
      />
    </div>
  );
};

export default FokusarkContent;
