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
        // First try loading from Supabase (faster)
        console.log("Loading from Supabase");
        const supabaseData = await loadAppointmentsFromSupabase();
        
        if (supabaseData && supabaseData.length > 0) {
          console.log(`Loaded ${supabaseData.length} rows from Supabase`);
          setTableData(supabaseData);
          setIsLoading(false);
          isInitialLoadRef.current = false;
          return;
        }
        
        // If no data in Supabase, try the API and save to Supabase
        console.log("No data in Supabase, trying API");
        const success = await fetchAndProcessData();
        
        if (!success && initialData && initialData.length > 0) {
          console.log("API failed, using initialData as fallback");
          setTableData(initialData);
        }
      } catch (err) {
        handleError(err);
      } finally {
        setIsLoading(false);
        isInitialLoadRef.current = false;
      }
    };
    
    loadData();
  }, [initialData]);
  
  // Separate function for fetching from API and processing data
  const fetchAndProcessData = async () => {
    try {
      // Try to get fresh data from API
      const appointments = await fetchAppointments();
      
      if (appointments && appointments.length > 0) {
        console.log(`Got ${appointments.length} appointments from API`);
        
        // Map the data for display
        const mappedData = await mapAppointmentsToTableData(appointments);
        setTableData(mappedData);
        
        // Save to Supabase
        const saveSuccess = await saveAppointmentsToSupabase(appointments);
        if (saveSuccess) {
          console.log("Saved to Supabase successfully");
        } else {
          console.error("Failed to save to Supabase");
        }
        
        return true;
      } else {
        console.warn("API returned no appointments");
        return false;
      }
    } catch (err) {
      throw err;
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
          } else {
            setTableData([]);
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
    
    try {
      // Update the cell value in the local state
      const newData = [...tableData];
      newData[rowIndex][colIndex] = value;
      setTableData(newData);
      
      // Map the array index to the Supabase column name
      const columnName = `${colIndex + 1} col`;
      
      // Get the appointment number or ID for the row
      const rowId = rowIndex.toString();
      const appointmentNumber = newData[rowIndex][0]; // First column usually contains appointment number
      
      console.log(`Updating cell: row=${rowId}, column=${columnName}, appointmentNumber=${appointmentNumber}, value=${value}`);
      
      // Create update data
      const updateData: Record<string, any> = {
        [columnName]: value
      };
      
      // If there's an appointment number, use it as well for more reliable updates
      if (appointmentNumber) {
        updateData['1 col'] = appointmentNumber;
      }
      
      // Update in Supabase using the row ID
      const { data, error } = await supabase
        .from('fokusark_table')
        .upsert({
          id: rowId,
          ...updateData
        });
      
      if (error) {
        console.error("Error updating Supabase:", error);
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
      const success = await fetchAndProcessData();
      if (!success) {
        toast.error("Failed to refresh data from API");
      } else {
        toast.success("Data refreshed successfully");
      }
      return success;
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
