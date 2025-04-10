
import React, { useState, useEffect } from "react";
import FokusarkDescription from "./FokusarkDescription";
import MinimalStickyTable from "./MinimalStickyTable";
import { useFokusarkTable } from "@/hooks/useFokusarkTable";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

const FokusarkContent: React.FC = () => {
  const { isLoading, tableData, error, handleCellChange, handleCellBlur, refreshData } = useFokusarkTable([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshData();
      toast.success("Data refreshed successfully");
    } catch (err) {
      toast.error("Failed to refresh data");
      console.error("Refresh error:", err);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-4 pb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Fokusark</h2>
        <FokusarkDescription />
        
        <div className="flex justify-end gap-2">
          <Button 
            onClick={handleRefresh}
            className="gap-2"
            disabled={isRefreshing || isLoading}
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
      
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="ml-2 text-muted-foreground">Loading appointment data...</p>
        </div>
      ) : error ? (
        <div className="p-8 border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50 rounded-md">
          <h3 className="text-lg font-medium mb-2 text-red-600 dark:text-red-400">Error Loading Data</h3>
          <p className="text-sm text-red-500 dark:text-red-300">
            {error.message || "There was a problem fetching appointment data."}
          </p>
          <p className="text-sm mt-2 text-muted-foreground">
            Please check API connectivity and try refreshing.
          </p>
        </div>
      ) : tableData && tableData.length > 0 ? (
        <MinimalStickyTable 
          tableData={tableData} 
          onCellChange={handleCellChange}
          onCellBlur={handleCellBlur}
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
