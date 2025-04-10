
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  fetchAppointments, 
  mapAppointmentsToTableData, 
  saveAppointmentsToSupabase,
  loadAppointmentsFromSupabase
} from '@/services/appointmentService';

export const useFokusarkTable = (initialData: string[][]) => {
  const [tableData, setTableData] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Always try to get fresh data from API first
        const appointments = await fetchAppointments();
        
        if (appointments && appointments.length > 0) {
          console.log(`Got ${appointments.length} appointments from API`);
          
          // Map the data for display
          const mappedData = mapAppointmentsToTableData(appointments);
          setTableData(mappedData);
          
          // Save to Supabase in the background
          saveAppointmentsToSupabase(appointments)
            .then(success => {
              if (success) {
                console.log("Saved to Supabase successfully");
              } else {
                console.error("Failed to save to Supabase");
              }
            });
        } else {
          // Fallback: Try to load from Supabase
          console.log("No data from API, trying Supabase");
          const supabaseData = await loadAppointmentsFromSupabase();
          
          if (supabaseData && supabaseData.length > 0) {
            console.log(`Loaded ${supabaseData.length} rows from Supabase`);
            setTableData(supabaseData);
          } else if (initialData && initialData.length > 0) {
            // Last resort: use initial data
            console.log("Using initialData as last resort");
            setTableData(initialData);
          } else {
            setTableData([]);
            toast.error("No data available from any source");
          }
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
        
        // Attempt to load from Supabase as fallback
        try {
          const supabaseData = await loadAppointmentsFromSupabase();
          if (supabaseData && supabaseData.length > 0) {
            setTableData(supabaseData);
            toast.warning("Using cached data from database. API connection failed.");
          } else {
            setTableData([]);
          }
        } catch (fallbackErr) {
          console.error("Fallback error:", fallbackErr);
          setTableData([]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [initialData]);
  
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
    setIsLoading(true);
    toast.info("Refreshing data from API...");
    
    try {
      const appointments = await fetchAppointments();
      
      if (appointments && appointments.length > 0) {
        console.log(`Fetched ${appointments.length} fresh appointments from API`);
        
        // Map to table data format
        const mappedData = mapAppointmentsToTableData(appointments);
        setTableData(mappedData);
        
        // Save to Supabase
        const saveSuccess = await saveAppointmentsToSupabase(appointments);
        
        if (saveSuccess) {
          toast.success(`Successfully refreshed and saved ${appointments.length} appointments`);
        } else {
          toast.error("Failed to save data to database");
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
    error,
    handleCellChange,
    refreshData
  };
};
