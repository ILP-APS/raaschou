
import { useState, useEffect, useCallback } from "react";
import { generateTableData } from "@/utils/tableData";
import { useToast } from "@/hooks/use-toast";

export const useFokusarkData = () => {
  const [tableData, setTableData] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Function to load data
  const loadData = useCallback(async () => {
    console.log("Starting to load fokusark data");
    setIsLoading(true);
    try {
      // Generate sample data for development
      const data = generateTableData(15); // Generate 15 rows of sample data
      console.log("Generated sample data:", {
        rowCount: data.length,
        sampleFirstRow: data[0]?.slice(0, 5) || 'No data generated'
      });
      setTableData(data);
    } catch (error) {
      console.error("Error loading fokusark data:", error);
      toast({
        title: "Error loading data",
        description: "There was a problem loading the table data.",
        variant: "destructive",
      });
      // Set empty array on error
      setTableData([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  // Initial data load
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Function to manually refresh data
  const refreshData = useCallback(() => {
    console.log("Manually refreshing fokusark data");
    loadData();
  }, [loadData]);
  
  return { 
    tableData, 
    isLoading,
    refreshData
  };
};
