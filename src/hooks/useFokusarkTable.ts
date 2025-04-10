
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  fetchAppointments, 
  mapAppointmentsToTableData, 
  saveAppointmentsToSupabase,
  loadAppointmentsFromSupabase
} from '@/services/appointmentService';

export interface FokusarkTableData {
  data: string[][];
  isLoading: boolean;
  error?: string | null;
}

/**
 * Main hook for handling the Fokusark table functionality
 * Uses real data from the API and stores it in Supabase
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
      
      console.log(`Initializing table data from API and Supabase`);
      setIsLoading(true);
      setError(null);
      isDataFetchedRef.current = true;
      
      try {
        // Always prioritize fresh data from the API 
        console.log("Fetching fresh data from API");
        const appointments = await fetchAppointments();
        
        if (appointments && appointments.length > 0) {
          console.log(`Fetched ${appointments.length} appointments from API`);
          
          // Map appointments to table data format
          const mappedData = mapAppointmentsToTableData(appointments);
          
          // Save to Supabase
          const saveSuccess = await saveAppointmentsToSupabase(appointments);
          
          if (saveSuccess) {
            toast.success("Successfully saved real appointment data to Supabase");
          } else {
            toast.error("Failed to save appointment data to Supabase");
          }
          
          // Set the mapped data to state
          setTableData(mappedData);
          setIsInitialized(true);
          setIsLoading(false);
          return;
        }
        // If no API data, try loading from Supabase as fallback
        else {
          console.log("No data available from API, checking Supabase");
          const supabaseData = await loadAppointmentsFromSupabase();
          
          if (supabaseData && supabaseData.length > 0) {
            console.log(`Loaded ${supabaseData.length} rows from Supabase as fallback`);
            setTableData(supabaseData);
          } else if (initialData && initialData.length > 0) {
            console.log(`Using provided initial data as last resort: ${initialData.length} rows`);
            setTableData(initialData);
          } else {
            console.log("No data available from any source");
            setTableData([]);
            toast.error("No appointment data available");
          }
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing table data:", error);
        setError(error instanceof Error ? error : new Error('Unknown error'));
        
        // Try loading from Supabase as fallback if API failed
        try {
          const supabaseData = await loadAppointmentsFromSupabase();
          if (supabaseData && supabaseData.length > 0) {
            console.log(`Loaded ${supabaseData.length} rows from Supabase after API failure`);
            setTableData(supabaseData);
            toast.warning("Using cached data. API connection failed.");
          } else if (initialData && initialData.length > 0) {
            console.log(`Using provided initial data after API and DB failure: ${initialData.length} rows`);
            setTableData(initialData);
            toast.error("Using backup data. API and database connection failed.");
          } else {
            setTableData([]);
          }
        } catch (fallbackError) {
          console.error("Fallback error:", fallbackError);
          setTableData([]);
        }
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
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
      
      // Update the corresponding row in Supabase
      try {
        // Get the appointment number from the current row
        const appointmentNumber = newData[rowIndex][0];
        
        if (!appointmentNumber) {
          console.error("Invalid appointment number for row update");
          return false;
        }
        
        // Update the specific cell in Supabase
        const { error: updateError } = await supabase
          .from('fokusark_table')
          .update({ [`${colIndex + 1} col`]: value })
          .eq('1 col', appointmentNumber);
        
        if (updateError) {
          console.error("Error updating cell in Supabase:", updateError);
          toast.error("Failed to save cell change to database");
          return false;
        }
        
        toast.success("Cell updated in database");
      } catch (error) {
        console.error("Error updating cell in Supabase:", error);
        toast.error("Failed to save cell change to database");
        return false;
      }
      
      return true;
    } else {
      console.warn(`Row ${rowIndex} does not exist, cannot update cell`);
      return false;
    }
  };
  
  const refreshData = async () => {
    setIsLoading(true);
    toast.info("Refreshing data from API...");
    
    try {
      // Force fetch fresh data from the API
      const appointments = await fetchAppointments();
      
      if (appointments && appointments.length > 0) {
        console.log(`Fetched ${appointments.length} fresh appointments from API`);
        
        // Map to table data format
        const mappedData = mapAppointmentsToTableData(appointments);
        
        // Force save to Supabase (this will clear existing data and insert new data)
        const saveSuccess = await saveAppointmentsToSupabase(appointments);
        
        if (saveSuccess) {
          toast.success("Successfully refreshed and saved real data to Supabase");
          setTableData(mappedData);
        } else {
          toast.error("Failed to save refreshed data to Supabase");
          // Still update the UI with the new data even if save failed
          setTableData(mappedData);
        }
      } else {
        toast.error("No data available from API");
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data from API");
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
