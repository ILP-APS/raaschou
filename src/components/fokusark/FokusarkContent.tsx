
import React, { useState } from "react";
import FokusarkDescription from "./FokusarkDescription";
import MinimalStickyTable from "./MinimalStickyTable";
import { useFokusarkTable } from "@/hooks/useFokusarkTable";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const FokusarkContent: React.FC = () => {
  const { isLoading, tableData, isInitialized, handleCellChange, refreshData } = useFokusarkTable([]);
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
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
      </div>
      
      {tableData && tableData.length > 0 ? (
        <MinimalStickyTable 
          tableData={tableData} 
          onCellChange={handleCellChange}
        />
      ) : (
        <div className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">No data available. Try refreshing.</p>
        </div>
      )}
    </div>
  );
};

export default FokusarkContent;
