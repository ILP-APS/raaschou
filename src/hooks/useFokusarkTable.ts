
import { useState, useEffect, useRef } from 'react';
import { generateTableData } from '@/utils/tableData';
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
 * Uses real data from the API mocks and stores it in Supabase
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
        // First try to load data from Supabase
        const supabaseData = await loadAppointmentsFromSupabase();
        
        // If we have data in Supabase, use it
        if (supabaseData && supabaseData.length > 0) {
          console.log(`Loaded ${supabaseData.length} rows from Supabase`);
          setTableData(supabaseData);
          setIsInitialized(true);
          setIsLoading(false);
          return;
        }
        
        // If no data in Supabase, fetch from API and save to Supabase
        console.log("No data in Supabase, fetching from API");
        const appointments = await fetchAppointments();
        
        if (appointments && appointments.length > 0) {
          console.log(`Fetched ${appointments.length} appointments from API`);
          
          // Map appointments to table data format
          const mappedData = mapAppointmentsToTableData(appointments);
          
          // Save to Supabase
          const saveSuccess = await saveAppointmentsToSupabase(appointments);
          
          if (saveSuccess) {
            toast.success("Successfully saved appointment data to Supabase");
          } else {
            toast.error("Failed to save appointment data to Supabase");
          }
          
          // Set the mapped data to state
          setTableData(mappedData);
        } 
        // If no API data either, use provided data as fallback
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
    
    try {
      // Force fetch fresh data from the API mock
      const appointments = await fetchAppointments();
      
      if (appointments && appointments.length > 0) {
        // Map to table data format
        const mappedData = mapAppointmentsToTableData(appointments);
        
        // Force save to Supabase (this will clear existing data and insert new data)
        const saveSuccess = await saveAppointmentsToSupabase(appointments);
        
        if (saveSuccess) {
          toast.success("Successfully refreshed and saved data to Supabase");
          
          // Load the fresh data from Supabase to ensure consistent view
          const supabaseData = await loadAppointmentsFromSupabase();
          
          if (supabaseData && supabaseData.length > 0) {
            setTableData(supabaseData);
          } else {
            // Fallback to mapped data if Supabase load fails
            setTableData(mappedData);
          }
        } else {
          toast.error("Failed to save refreshed data to Supabase");
          // Still update the UI with the new data even if save failed
          setTableData(mappedData);
        }
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
