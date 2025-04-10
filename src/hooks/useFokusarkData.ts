
import { useState, useEffect, useCallback } from "react";
import { generateTableData } from "@/utils/tableData";

export const useFokusarkData = () => {
  const [tableData, setTableData] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Generate sample data for now
        const data = generateTableData();
        setTableData(data);
      } catch (error) {
        console.error("Error loading data:", error);
        setTableData([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const refreshData = useCallback(() => {
    setIsLoading(true);
    try {
      const data = generateTableData();
      setTableData(data);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return { 
    tableData, 
    isLoading,
    refreshData
  };
};
