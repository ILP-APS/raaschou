
import { useState, useEffect } from 'react';
import { generateTableData } from '@/utils/tableData';
import { toast } from 'sonner';
import { fetchAppointments, mapAppointmentsToTableData } from '@/services/appointmentService';

export interface FokusarkTableData {
  data: string[][];
  isLoading: boolean;
  error?: string | null;
}

/**
 * Main hook for handling the Fokusark table functionality
 * Uses mock data since API fetching is disabled
 */
export const useFokusarkTable = (initialData: string[][]) => {
  const [tableData, setTableData] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const initData = async () => {
      console.log(`Initializing table data`);
      setIsLoading(true);
      setError(null);
      
      try {
        // Generate mock data instead of API fetching
        const appointments = await fetchAppointments();
        
        if (appointments && appointments.length > 0) {
          console.log(`Using mock data: ${appointments.length} appointments`);
          const mappedData = mapAppointmentsToTableData(appointments);
          setTableData(mappedData);
          toast.success(`Generated ${appointments.length} mock appointments`);
        } 
        // If no mock data, use provided data or generate sample data
        else if (initialData && initialData.length > 0) {
          console.log(`Using provided data: ${initialData.length} rows`);
          setTableData(initialData);
        } else {
          console.log("No initial data, generating sample data");
          const generatedData = generateTableData();
          console.log(`Generated ${generatedData.length} rows of sample data`);
          setTableData(generatedData);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing table data:", error);
        
        // Fallback to generated data
        try {
          console.log("Attempting to use fallback generated data");
          const generatedData = generateTableData();
          setTableData(generatedData);
          toast.warning("Using fallback data");
        } catch (fallbackError) {
          console.error("Failed to generate fallback data:", fallbackError);
          setTableData([]);
          toast.error("Failed to load any data");
        }
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
      isInitialized,
      hasError: error !== null
    });
  }, [initialData, tableData, isLoading, isInitialized, error]);
  
  const handleCellChange = async (rowIndex: number, colIndex: number, value: string) => {
    console.log("Cell change:", rowIndex, colIndex, value);
    
    const newData = [...tableData];
    if (newData[rowIndex]) {
      newData[rowIndex][colIndex] = value;
      setTableData(newData);
      return true;
    } else {
      console.warn(`Row ${rowIndex} does not exist, cannot update cell`);
      return false;
    }
  };
  
  const refreshData = async () => {
    setIsLoading(true);
    
    try {
      // Generate new mock data
      const appointments = await fetchAppointments();
      const mappedData = mapAppointmentsToTableData(appointments);
      setTableData(mappedData);
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
      
      // Fallback to generated data
      const data = generateTableData();
      setTableData(data);
    } finally {
      setIsLoading(false);
    }
  };
  
  return { 
    tableData, 
    isLoading, 
    isInitialized, 
    error,
    handleCellChange,
    refreshData
  };
};
