
import { useState, useEffect } from 'react';
import { generateTableData } from '@/utils/tableData';

export interface FokusarkTableData {
  data: string[][];
  isLoading: boolean;
}

/**
 * Main hook for handling the Fokusark table functionality
 * Simplified version to ensure data is properly displayed
 */
export const useFokusarkTable = (initialData: string[][]) => {
  const [tableData, setTableData] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    const initData = async () => {
      console.log("Initializing table data with:", initialData?.length || 0, "rows");
      setIsLoading(true);
      
      try {
        // Use provided data or generate sample data if none
        if (initialData && initialData.length > 0) {
          console.log("Using provided data");
          // Use all rows without limitation
          setTableData(initialData);
        } else {
          console.log("No initial data, using generated data");
          const generatedData = generateTableData();
          setTableData(generatedData);
        }
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing table data:", error);
        // Fallback to generated data
        const generatedData = generateTableData();
        setTableData(generatedData);
      } finally {
        setIsLoading(false);
      }
    };
    
    initData();
  }, [initialData]);
  
  // Debug logs
  useEffect(() => {
    console.log("useFokusarkTable state:", {
      initialDataLength: initialData?.length || 0,
      tableDataLength: tableData?.length || 0,
      isLoading,
      isInitialized
    });
  }, [initialData, tableData, isLoading, isInitialized]);
  
  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    console.log("Cell change:", rowIndex, colIndex, value);
    
    const newData = [...tableData];
    if (newData[rowIndex]) {
      newData[rowIndex][colIndex] = value;
      setTableData(newData);
    }
  };
  
  return { tableData, isLoading, isInitialized, handleCellChange };
};
