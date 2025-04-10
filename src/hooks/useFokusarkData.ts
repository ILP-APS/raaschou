
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export const useFokusarkData = () => {
  const [tableData, setTableData] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // No sample data - just return empty array
        setTableData([]);
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Failed to load data. Please try again.");
        setTableData([]);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const refreshData = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    try {
      // No sample data - just return empty array
      setTableData([]);
      toast.success("Data refreshed");
    } catch (error) {
      console.error("Error refreshing data:", error);
      setError("Failed to refresh data");
      toast.error("Failed to refresh data");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return { 
    tableData, 
    isLoading,
    error,
    refreshData
  };
};
