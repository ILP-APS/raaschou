import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { 
  fetchAppointments, 
  mapAppointmentsToTableData, 
  saveAppointmentsToSupabase,
  loadAppointmentsFromSupabase
} from '@/services/appointmentService';
import { supabase } from '@/integrations/supabase/client';

export const useFokusarkTable = (initialData: string[][]) => {
  const [tableData, setTableData] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isInitialLoadRef = useRef(true);
  
  // Initial data load
  useEffect(() => {
    // Only run once during initial mount
    if (!isInitialLoadRef.current) {
      return;
    }
    
    const loadData = async () => {
      if (isRefreshing) {
        console.log("Skipping load during refresh");
        return; // Prevent duplicate fetches
      }
      
      setIsLoading(true);
      setError(null);
      console.log('Initial loading of data in useFokusarkTable');
      
      try {
        // First try loading from Supabase (faster and prevents unnecessary API calls)
        console.log("First trying to load from Supabase cache");
        const supabaseData = await loadAppointmentsFromSupabase();
        
        if (supabaseData && supabaseData.length > 0) {
          console.log(`Loaded ${supabaseData.length} rows from Supabase cache`);
          setTableData(supabaseData);
          setIsLoading(false);
          
          // After showing cached data, refresh in the background for fresh data
          refreshDataInBackground();
          return;
        }
        
        // If no data in Supabase, try the API
        console.log("No data in Supabase cache, trying API directly");
        await fetchAndProcessData();
      } catch (err) {
        handleError(err);
      } finally {
        setIsLoading(false);
        isInitialLoadRef.current = false;
      }
    };
    
    loadData();
  }, []);
  
  // Separate function for fetching from API and processing data
  const fetchAndProcessData = async () => {
    try {
      // Try to get fresh data from API
      const appointments = await fetchAppointments();
      
      if (appointments && appointments.length > 0) {
        console.log(`Got ${appointments.length} appointments from API`);
        
        // Map the data for display - Make sure to await the promise
        const mappedData = await mapAppointmentsToTableData(appointments);
        setTableData(mappedData);
        
        // Save to Supabase in the background
        saveAppointmentsToSupabase(appointments)
          .then(success => {
            if (success) {
              console.log("Saved to Supabase successfully");
            } else {
              console.error("Failed to save to Supabase");
            }
          })
          .catch(err => {
            console.error("Error saving to Supabase:", err);
          });
        
        return true;
      } else {
        console.warn("API returned no appointments");
        setTableData(initialData || []);
        return false;
      }
    } catch (err) {
      throw err;
    }
  };
  
  // Function to refresh data in the background (without setting loading state)
  const refreshDataInBackground = async () => {
    console.log("Refreshing data in background...");
    try {
      await fetchAndProcessData();
    } catch (err) {
      console.error("Background refresh error:", err);
      // Don't show error to user for background refreshes
    }
  };
  
  // Handle errors in a consistent way
  const handleError = (err: any) => {
    console.error("Error loading data:", err);
    setError(err instanceof Error ? err : new Error(String(err)));
    
    // If we have initialData, use it as fallback
    if (initialData && initialData.length > 0) {
      console.log("Using initialData as fallback");
      setTableData(initialData);
    } else {
      // Otherwise, try one more time to load from Supabase
      loadAppointmentsFromSupabase()
        .then(data => {
          if (data && data.length > 0) {
            console.log("Recovered with Supabase fallback data");
            setTableData(data);
            toast.warning("Using cached data. Failed to connect to API.");
          }
        })
        .catch(() => {
          console.error("Complete data loading failure");
          setTableData([]);
        });
    }
  };
  
  // Handle cell changes
  const handleCellChange = async (rowIndex: number, colIndex: number, value: string) => {
    if (!tableData[rowIndex]) return false;
    
    // Update the cell value
    const newData = [...tableData];
    newData[rowIndex][colIndex] = value;
    setTableData(newData);
    
    // Try to update in Supabase
    try {
      const appointmentNumber = newData[rowIndex][0];
      
      if (!appointmentNumber) {
        console.error("Invalid appointment number");
        toast.error("Failed to save: Missing appointment number");
        return false;
      }
      
      const { error } = await supabase
        .from('fokusark_table')
        .update({ [`${colIndex + 1} col`]: value })
        .eq('1 col', appointmentNumber);
      
      if (error) {
        console.error("Error updating cell:", error);
        toast.error("Failed to save changes");
        return false;
      }
      
      toast.success("Cell updated in database");
      return true;
    } catch (error) {
      console.error("Error updating cell:", error);
      toast.error("Failed to save changes");
      return false;
    }
  };
  
  // Refresh data from API
  const refreshData = async () => {
    setIsRefreshing(true);
    setError(null);
    
    try {
      await fetchAndProcessData();
      return true;
    } catch (err) {
      handleError(err);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return { 
    tableData, 
    isLoading, 
    error,
    handleCellChange,
    refreshData
  };
};
