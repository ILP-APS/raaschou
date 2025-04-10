
import { useState, useEffect } from 'react';
import { generateTableData } from '@/utils/tableData';
import { useToast } from '@/hooks/use-toast';

export interface FokusarkTableData {
  data: string[][];
  isLoading: boolean;
}

/**
 * Main hook for handling the Fokusark table functionality
 * Enhanced version with better error handling and debugging
 */
export const useFokusarkTable = (initialData: string[][]) => {
  const [tableData, setTableData] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const initData = async () => {
      console.log("useFokusarkTable - Initializing with:", {
        initialDataProvided: Boolean(initialData && initialData.length > 0),
        initialDataLength: initialData?.length || 0,
        sample: initialData && initialData.length > 0 ? initialData[0]?.slice(0, 3) : 'No data'
      });
      
      setIsLoading(true);
      
      try {
        // Use provided data or generate sample data if none
        if (initialData && initialData.length > 0) {
          console.log("Using provided data:", initialData.slice(0, 2));
          setTableData(initialData);
        } else {
          console.log("No initial data, generating sample data");
          const generatedData = generateTableData(10); // Generate 10 rows of sample data
          console.log("Generated sample data:", {
            rowCount: generatedData.length,
            sampleFirstRow: generatedData[0]?.slice(0, 5)
          });
          setTableData(generatedData);
          
          toast({
            title: "Using sample data",
            description: "No initial data provided. Using generated sample data instead.",
          });
        }
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing table data:", error);
        setError(error instanceof Error ? error : new Error(String(error)));
        
        // Fallback to generated data
        console.log("Error occurred, using fallback generated data");
        const generatedData = generateTableData(5);
        setTableData(generatedData);
        
        toast({
          title: "Error loading data",
          description: "An error occurred while loading the table data. Using sample data instead.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initData();
  }, [initialData, toast]);
  
  // Debug logs
  useEffect(() => {
    console.log("useFokusarkTable state updated:", {
      tableDataLength: tableData?.length || 0,
      isLoading,
      isInitialized,
      hasError: error !== null,
      sampleData: tableData && tableData.length > 0 ? tableData[0]?.slice(0, 3) : 'No data'
    });
  }, [tableData, isLoading, isInitialized, error]);
  
  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    console.log("Cell change:", rowIndex, colIndex, value);
    
    const newData = [...tableData];
    if (newData[rowIndex]) {
      newData[rowIndex][colIndex] = value;
      setTableData(newData);
    }
  };
  
  return { 
    tableData, 
    isLoading, 
    isInitialized, 
    error,
    handleCellChange 
  };
};
