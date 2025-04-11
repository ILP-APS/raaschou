
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { 
  fetchAppointments, 
  mapAppointmentsToTableData, 
  saveAppointmentsToSupabase,
  loadAppointmentsFromSupabase
} from '@/services/appointmentService';
import { supabase } from '@/integrations/supabase/client';
import { parseNumber, formatDanishNumber } from '@/utils/numberFormatUtils';

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
        let supabaseData = await loadAppointmentsFromSupabase();
        
        if (supabaseData && supabaseData.length > 0) {
          console.log(`Loaded ${supabaseData.length} rows from Supabase`);
          
          // Sort the data by appointment number (column 0)
          supabaseData = sortTableData(supabaseData);
          console.log("Data sorted by appointment number");
          
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
          const sortedInitialData = sortTableData(initialData);
          setTableData(sortedInitialData);
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
  
  // Helper function to sort table data by appointment number
  const sortTableData = (data: string[][]): string[][] => {
    return [...data].sort((a, b) => {
      // Extract numeric part from appointment numbers (e.g., "25119-2" -> 25119)
      const numA = parseInt(a[0]?.split('-')[0] || '0');
      const numB = parseInt(b[0]?.split('-')[0] || '0');
      
      // If main numbers are the same, check for suffix
      if (numA === numB) {
        const suffixA = a[0]?.split('-')[1] ? parseInt(a[0].split('-')[1]) : 0;
        const suffixB = b[0]?.split('-')[1] ? parseInt(b[0].split('-')[1]) : 0;
        return suffixA - suffixB;
      }
      
      return numA - numB;
    });
  };
  
  // Separate function for fetching from API and processing data
  const fetchAndProcessData = async () => {
    try {
      // Try to get fresh data from API
      const appointments = await fetchAppointments();
      
      if (appointments && appointments.length > 0) {
        console.log(`Got ${appointments.length} appointments from API`);
        
        // Map the data for display
        const mappedData = await mapAppointmentsToTableData(appointments);
        
        // Sort the data
        const sortedData = sortTableData(mappedData);
        
        setTableData(sortedData);
        
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
      const sortedInitialData = sortTableData(initialData);
      setTableData(sortedInitialData);
    } else {
      // Otherwise, try one more time to load from Supabase
      loadAppointmentsFromSupabase()
        .then(data => {
          if (data && data.length > 0) {
            console.log("Recovered with Supabase fallback data");
            const sortedData = sortTableData(data);
            setTableData(sortedData);
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
    // This function now only updates the UI without saving to the database
    if (!tableData[rowIndex]) {
      console.error("Invalid row index", rowIndex);
      toast.error("Failed to update: invalid row");
      return false;
    }
    
    try {
      // Update the cell value in the local state
      const newData = [...tableData];
      newData[rowIndex][colIndex] = value;
      setTableData(newData);
      
      return true;
    } catch (error) {
      console.error("Error updating cell:", error);
      toast.error("Failed to update cell value");
      return false;
    }
  };
  
  // Handle cell blur (finalize cell edit)
  const handleCellBlur = async (rowIndex: number, colIndex: number, value: string) => {
    if (!tableData[rowIndex]) {
      console.error("Invalid row index", rowIndex);
      toast.error("Failed to save changes: invalid row");
      return false;
    }
    
    try {
      const appointmentNumber = tableData[rowIndex][0]; // First column contains appointment number
      console.log(`Saving cell value: row=${rowIndex}, column=${colIndex}, value=${value} for appointment ${appointmentNumber}`);
      
      // For numeric values, ensure we preserve the raw input
      // Remove formatting artifacts but keep the value intact
      let valueToSave = value.trim();
      
      // Remove "DKK" suffix if present
      if (valueToSave.includes("DKK")) {
        valueToSave = valueToSave.replace(/ DKK/g, "");
      }
      
      // For columns 6 and 7 (Montage2 and Underleverandor2) which are money values
      // Make sure we store the proper numeric value
      if (colIndex === 6 || colIndex === 7) {
        // Parse Danish formatted numbers (e.g., "2.000" -> 2000)
        const rawNumericValue = parseNumber(valueToSave);
        
        // Store the raw number value as a string without formatting
        valueToSave = String(rawNumericValue);
        
        console.log(`Processing numeric value for column ${colIndex}:
          - Original input: ${value}
          - Cleaned value: ${valueToSave} 
          - Parsed as number: ${rawNumericValue}`);
      }
      
      console.log(`Saving cell for appointment ${appointmentNumber}, column=${colIndex + 1}, value=${valueToSave}`);
      
      // Display saving notification
      toast.loading(`Saving changes for appointment ${appointmentNumber}...`);
      
      // Create update data
      const updateData: Record<string, any> = {
        [`${colIndex + 1} col`]: valueToSave
      };
      
      // Add the first 3 columns as identifiers to ensure we're updating the right row
      updateData['1 col'] = tableData[rowIndex][0] || ''; // Appointment number
      updateData['2 col'] = tableData[rowIndex][1] || ''; // Subject
      updateData['3 col'] = tableData[rowIndex][2] || ''; // Responsible
      
      // First check if this appointment already exists in the database
      const { data: existingRows, error: fetchError } = await supabase
        .from('fokusark_table')
        .select('id')
        .eq('1 col', appointmentNumber);
      
      if (fetchError) {
        console.error("Error checking existing rows:", fetchError);
        toast.error("Failed to save changes to database");
        return false;
      }
      
      let result;
      
      if (existingRows && existingRows.length > 0) {
        // Update existing row
        console.log(`Updating existing row for appointment ${appointmentNumber}, column ${colIndex + 1}`, updateData);
        const { data, error } = await supabase
          .from('fokusark_table')
          .update(updateData)
          .eq('id', existingRows[0].id)
          .select();
          
        result = { data, error };
        console.log(`Update result:`, error ? `Error: ${error.message}` : `Success, updated ${data?.length} rows`);
      } else {
        // Insert new row with a proper UUID
        updateData.id = crypto.randomUUID();
        
        console.log(`Inserting new row for appointment ${appointmentNumber}, column ${colIndex + 1}`, updateData);
        const { data, error } = await supabase
          .from('fokusark_table')
          .insert([updateData])
          .select();
          
        result = { data, error };
        console.log(`Insert result:`, error ? `Error: ${error.message}` : `Success, inserted ${data?.length} rows`);
      }
      
      if (result.error) {
        console.error("Error updating Supabase:", result.error);
        toast.error("Failed to save changes to database");
        return false;
      }
      
      // Double check that the data was stored correctly by fetching it back
      const { data: verifyData, error: verifyError } = await supabase
        .from('fokusark_table')
        .select(`${colIndex + 1} col`)
        .eq('1 col', appointmentNumber)
        .single();
      
      if (verifyError) {
        console.warn("Could not verify data was saved correctly:", verifyError);
      } else {
        console.log(`Verification: Value saved in database: ${verifyData[`${colIndex + 1} col`]}`);
        
        // For numeric columns, verify if the values match (accounting for potential string/number type differences)
        if (colIndex === 6 || colIndex === 7) {
          // Parse both values to numbers to compare them
          const savedNumberValue = parseFloat(verifyData[`${colIndex + 1} col`]);
          const expectedNumberValue = parseFloat(valueToSave);
          
          if (isNaN(savedNumberValue) || isNaN(expectedNumberValue) || savedNumberValue !== expectedNumberValue) {
            console.warn(`Value mismatch! Expected ${valueToSave} but got ${verifyData[`${colIndex + 1} col`]}`);
            toast.warning("Warning: Saved value may be incorrect. Please refresh and check.");
          }
        } else if (verifyData[`${colIndex + 1} col`] !== valueToSave) {
          console.warn(`Value mismatch! Expected ${valueToSave} but got ${verifyData[`${colIndex + 1} col`]}`);
        }
      }
      
      // Display confirmation to the user
      toast.success(`Changes saved successfully for appointment ${appointmentNumber}`);
      
      // For money columns, update the UI with formatted values after successful save
      if (colIndex === 6 || colIndex === 7) {
        const rawValue = parseNumber(valueToSave);
        const displayValue = `${formatDanishNumber(rawValue)} DKK`;
        console.log(`Updating UI with formatted value: ${displayValue}`);
        
        // Update the UI with the formatted value
        const newData = [...tableData];
        newData[rowIndex][colIndex] = displayValue;
        setTableData(newData);
      }
      
      return true;
    } catch (error) {
      console.error("Error updating cell:", error);
      toast.error("Failed to save changes");
      return false;
    }
  };
  
  // Refresh data from API and Supabase
  const refreshData = async () => {
    setIsRefreshing(true);
    setError(null);
    toast.info("Refreshing data from database...");
    
    try {
      // First, try to get data directly from Supabase without fallbacks
      console.log("Refresh: Loading all data from Supabase...");
      const { data, error } = await supabase
        .from('fokusark_table')
        .select('*')
        .order('created_at');
      
      if (error) {
        console.error("Error fetching from Supabase during refresh:", error);
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log(`Refresh: Loaded ${data.length} rows directly from Supabase`);
        
        // Transform the data to the expected format
        const tableData: string[][] = data.map(row => [
          row['1 col'] || '',
          row['2 col'] || '',
          row['3 col'] || '',
          row['4 col'] || '',
          row['5 col'] || '',
          row['6 col'] || '',
          row['7 col'] || '',
          row['8 col'] || '',
          row['9 col'] || '',
          row['10 col'] || '',
          row['11 col'] || '',
          row['12 col'] || '',
          row['13 col'] || '',
          row['14 col'] || '',
          row['15 col'] || '',
          row['16 col'] || '',
          row['17 col'] || '',
          row['18 col'] || '',
          row['19 col'] || '',
          row['20 col'] || '',
          row['21 col'] || '',
          row['22 col'] || '',
          row['23 col'] || '',
          'regular-appointment'
        ]);
        
        // Sort the data
        const sortedTableData = sortTableData(tableData);
        
        setTableData(sortedTableData);
        toast.success("Data refreshed from database");
        setIsRefreshing(false);
        return true;
      }
      
      // If no data in Supabase or the data is empty, fall back to API
      console.log("Refresh: No data in Supabase, trying API");
      const success = await fetchAndProcessData();
      if (!success) {
        toast.error("Failed to refresh data from API");
      } else {
        toast.success("Data refreshed successfully from API");
      }
      return success;
    } catch (err) {
      console.error("Error during refresh:", err);
      handleError(err);
      toast.error("Failed to refresh data");
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
    handleCellBlur,
    refreshData,
    isRefreshing
  };
};
