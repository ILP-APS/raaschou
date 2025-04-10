
import { useState, useEffect, useRef } from 'react';
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
 * Uses real data from the API mocks
 */
export const useFokusarkTable = (initialData: string[][]) => {
  const [tableData, setTableData] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isDataFetchedRef = useRef(false);
  
  useEffect(() => {
    const initData = async () => {
      // Skip if already initialized or data is already fetched
      if (isInitialized || isDataFetchedRef.current) return;
      
      console.log(`Initializing table data from API`);
      setIsLoading(true);
      setError(null);
      isDataFetchedRef.current = true;
      
      try {
        // Get real data from the API mock
        const appointments = await fetchAppointments();
        
        if (appointments && appointments.length > 0) {
          console.log(`Loaded real data: ${appointments.length} appointments`);
          const mappedData = mapAppointmentsToTableData(appointments);
          setTableData(mappedData);
        } 
        // If no API data, use provided data as fallback
        else if (initialData && initialData.length > 0) {
          console.log(`Using provided data: ${initialData.length} rows`);
          setTableData(initialData);
        } else {
          console.log("No data available");
          setTableData([]);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing table data:", error);
        setError(error instanceof Error ? error : new Error('Unknown error'));
        setTableData([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    initData();
  }, [initialData]);
  
  // Debug logs
  useEffect(() => {
    if (isInitialized) {
      console.log("useFokusarkTable state:", {
        initialDataLength: initialData?.length || 0,
        tableDataLength: tableData?.length || 0,
        isLoading,
        isInitialized,
        hasError: error !== null
      });
    }
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
      // Get fresh data from the API mock
      const appointments = await fetchAppointments();
      if (appointments && appointments.length > 0) {
        const mappedData = mapAppointmentsToTableData(appointments);
        setTableData(mappedData);
        toast.success("Data refreshed successfully");
      } else {
        toast.error("No data available from API");
        setTableData([]);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
      setTableData([]);
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
