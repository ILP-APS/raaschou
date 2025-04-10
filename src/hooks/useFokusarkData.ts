
import { useState, useEffect, useCallback } from "react";
import { generateTableData } from "@/utils/tableData";
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
        
        // Generate sample data with enough columns for our expanded structure
        const data = generateTableData(24); // Generate 24 rows to ensure we have enough data
        console.log(`Generated ${data.length} rows of sample data`);
        
        // No row count limit, use whatever is returned
        setTableData(data);
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
      const data = generateTableData(24); // Generate 24 rows for consistent testing
      console.log(`Refreshed data with ${data.length} rows`);
      setTableData(data);
      toast.success("Data refreshed successfully");
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
