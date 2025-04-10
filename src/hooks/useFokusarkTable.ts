
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
 * Enhanced to fetch data from the e-regnskab API
 */
export const useFokusarkTable = (initialData: string[][]) => {
  const [tableData, setTableData] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const initData = async () => {
      console.log(`Initializing table data`);
      setIsLoading(true);
      setError(null);
      
      try {
        // First attempt to fetch data from the API
        const appointments = await fetchAppointments();
        
        if (appointments && appointments.length > 0) {
          console.log(`Using data from API: ${appointments.length} appointments`);
          const mappedData = mapAppointmentsToTableData(appointments);
          setTableData(mappedData);
          toast.success(`Loaded ${appointments.length} appointments from API`);
        } 
        // If no API data, use provided data or generate sample data
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
        setError("Failed to initialize table data");
        
        // Fallback to generated data
        try {
          console.log("Attempting to use fallback generated data");
          const generatedData = generateTableData();
          setTableData(generatedData);
          toast.warning("Using fallback data due to an error");
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
  
  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    console.log("Cell change:", rowIndex, colIndex, value);
    
    const newData = [...tableData];
    if (newData[rowIndex]) {
      newData[rowIndex][colIndex] = value;
      setTableData(newData);
    } else {
      console.warn(`Row ${rowIndex} does not exist, cannot update cell`);
    }
  };
  
  const refreshData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to fetch fresh data from the API first
      const appointments = await fetchAppointments();
      
      if (appointments && appointments.length > 0) {
        const mappedData = mapAppointmentsToTableData(appointments);
        setTableData(mappedData);
        toast.success(`Refreshed data with ${appointments.length} appointments from API`);
      } else {
        // Fallback to generated data if API returns nothing
        const data = generateTableData();
        console.log(`Refreshed with ${data.length} rows of generated data`);
        setTableData(data);
        toast.success("Data refreshed successfully");
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      setError("Failed to refresh data");
      toast.error("Failed to refresh data");
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
