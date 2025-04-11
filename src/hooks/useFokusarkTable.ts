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
  
  useEffect(() => {
    if (!isInitialLoadRef.current) {
      return;
    }
    
    const loadData = async () => {
      if (isRefreshing) {
        console.log("Skipping load during refresh");
        return;
      }
      
      setIsLoading(true);
      setError(null);
      console.log('Initial loading of data in useFokusarkTable');
      
      try {
        let supabaseData = await loadAppointmentsFromSupabase();
        
        if (supabaseData && supabaseData.length > 0) {
          console.log(`Loaded ${supabaseData.length} rows from Supabase`);
          
          supabaseData = sortTableData(supabaseData);
          console.log("Data sorted by appointment number");
          
          setTableData(supabaseData);
          setIsLoading(false);
          isInitialLoadRef.current = false;
          return;
        }
        
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
  
  const sortTableData = (data: string[][]): string[][] => {
    return [...data].sort((a, b) => {
      const numA = parseInt(a[0]?.split('-')[0] || '0');
      const numB = parseInt(b[0]?.split('-')[0] || '0');
      
      if (numA === numB) {
        const suffixA = a[0]?.split('-')[1] ? parseInt(a[0].split('-')[1]) : 0;
        const suffixB = b[0]?.split('-')[1] ? parseInt(b[0].split('-')[1]) : 0;
        return suffixA - suffixB;
      }
      
      return numA - numB;
    });
  };
  
  const fetchAndProcessData = async () => {
    try {
      const appointments = await fetchAppointments();
      
      if (appointments && appointments.length > 0) {
        console.log(`Got ${appointments.length} appointments from API`);
        
        const mappedData = await mapAppointmentsToTableData(appointments);
        const sortedData = sortTableData(mappedData);
        
        setTableData(sortedData);
        
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
  
  const handleError = (err: any) => {
    console.error("Error loading data:", err);
    setError(err instanceof Error ? err : new Error(String(err)));
    
    if (initialData && initialData.length > 0) {
      console.log("Using initialData as fallback");
      const sortedInitialData = sortTableData(initialData);
      setTableData(sortedInitialData);
    } else {
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
  
  const handleCellChange = async (rowIndex: number, colIndex: number, value: string) => {
    if (!tableData[rowIndex]) {
      console.error("Invalid row index", rowIndex);
      toast.error("Failed to update: invalid row");
      return false;
    }
    
    try {
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
  
  const handleCellBlur = async (rowIndex: number, colIndex: number, value: string) => {
    if (!tableData[rowIndex]) {
      console.error("Invalid row index", rowIndex);
      toast.error("Failed to save changes: invalid row");
      return false;
    }
    
    try {
      const appointmentNumber = tableData[rowIndex][0];
      console.log(`SAVE OPERATION: Saving cell value: row=${rowIndex}, column=${colIndex}, value=${value} for appointment ${appointmentNumber}`);
      
      let valueToSave = value.trim();
      
      if (valueToSave.includes("DKK")) {
        valueToSave = valueToSave.replace(/ DKK/g, "");
        console.log(`SAVE OPERATION: Removed DKK suffix, value now: ${valueToSave}`);
      }
      
      let rawNumericValue;
      
      if (/^\d+$/.test(valueToSave)) {
        rawNumericValue = parseInt(valueToSave, 10);
        console.log(`SAVE OPERATION: Plain number detected: "${valueToSave}" parsed as ${rawNumericValue}`);
      } 
      else if (/^[\d\.,]+$/.test(valueToSave)) {
        rawNumericValue = parseNumber(valueToSave);
        console.log(`SAVE OPERATION: Formatted number detected: "${valueToSave}" parsed as ${rawNumericValue}`);
      } 
      else {
        rawNumericValue = 0;
        console.log(`SAVE OPERATION: Invalid number format: "${valueToSave}" defaulting to 0`);
      }
      
      valueToSave = String(rawNumericValue);
      
      console.log(`SAVE OPERATION: Final numeric value for column ${colIndex}: ${valueToSave}`);
      
      console.log(`SAVE OPERATION: Final value to save to Supabase: appointment ${appointmentNumber}, column=${colIndex + 1}, value=${valueToSave}`);
      
      const toastId = `saving-${appointmentNumber}-${colIndex}`;
      toast.loading(`Saving changes for appointment ${appointmentNumber}...`, { id: toastId });
      
      const updateData: Record<string, any> = {
        [`${colIndex + 1} col`]: valueToSave
      };
      
      updateData['1 col'] = tableData[rowIndex][0] || '';
      updateData['2 col'] = tableData[rowIndex][1] || '';
      updateData['3 col'] = tableData[rowIndex][2] || '';
      
      const { data: existingRows, error: fetchError } = await supabase
        .from('fokusark_table')
        .select('id')
        .eq('1 col', appointmentNumber);
      
      if (fetchError) {
        console.error("SAVE OPERATION: Error checking existing rows:", fetchError);
        toast.error("Failed to save changes to database", { id: toastId });
        return false;
      }
      
      let result;
      
      if (existingRows && existingRows.length > 0) {
        console.log(`SAVE OPERATION: Updating existing row for appointment ${appointmentNumber}, column ${colIndex + 1}`, updateData);
        console.log(`SAVE OPERATION: Row ID: ${existingRows[0].id}`);
        
        const { data, error } = await supabase
          .from('fokusark_table')
          .update(updateData)
          .eq('id', existingRows[0].id)
          .select();
          
        result = { data, error };
        console.log(`SAVE OPERATION: Update result:`, error ? `Error: ${error.message}` : `Success, updated ${data?.length} rows`);
      } else {
        const rowId = crypto.randomUUID();
        updateData.id = rowId;
        
        console.log(`SAVE OPERATION: Inserting new row for appointment ${appointmentNumber}, column ${colIndex + 1}`, updateData);
        console.log(`SAVE OPERATION: Generated row ID: ${rowId}`);
        
        const { data, error } = await supabase
          .from('fokusark_table')
          .insert([updateData])
          .select();
          
        result = { data, error };
        console.log(`SAVE OPERATION: Insert result:`, error ? `Error: ${error.message}` : `Success, inserted ${data?.length} rows`);
      }
      
      if (result.error) {
        console.error("SAVE OPERATION: Error updating Supabase:", result.error);
        toast.error("Failed to save changes to database", { id: toastId });
        return false;
      }
      
      const { data: verifyData, error: verifyError } = await supabase
        .from('fokusark_table')
        .select(`${colIndex + 1} col`)
        .eq('1 col', appointmentNumber)
        .single();
      
      if (verifyError) {
        console.warn("SAVE OPERATION: Could not verify data was saved correctly:", verifyError);
        toast.warning("Changes saved, but could not verify", { id: toastId });
      } else {
        const savedValue = verifyData[`${colIndex + 1} col`];
        console.log(`SAVE OPERATION: Verification: Value saved in database: "${savedValue}"`);
        
        if (colIndex === 6 || colIndex === 7) {
          const savedNumberValue = parseFloat(savedValue);
          const expectedNumberValue = parseFloat(valueToSave);
          
          console.log(`SAVE OPERATION: Verification comparing values - Expected: ${expectedNumberValue}, Actual: ${savedNumberValue}`);
          
          if (isNaN(savedNumberValue) || isNaN(expectedNumberValue) || savedNumberValue !== expectedNumberValue) {
            console.warn(`SAVE OPERATION: Value mismatch! Expected ${valueToSave} but got ${savedValue}`);
            toast.warning("Warning: Saved value may be incorrect. Please refresh and check.", { id: toastId });
          } else {
            console.log(`SAVE OPERATION: Values match correctly - ${expectedNumberValue} = ${savedNumberValue}`);
            toast.success(`Changes saved successfully for appointment ${appointmentNumber}`, { id: toastId });
          }
        } else if (savedValue !== valueToSave) {
          console.warn(`SAVE OPERATION: Value mismatch! Expected ${valueToSave} but got ${savedValue}`);
          toast.warning("Warning: Saved value may be incorrect. Please refresh and check.", { id: toastId });
        } else {
          console.log(`SAVE OPERATION: Values match correctly for non-numeric field`);
          toast.success(`Changes saved successfully for appointment ${appointmentNumber}`, { id: toastId });
        }
      }
      
      if (colIndex === 6 || colIndex === 7) {
        const rawValue = parseNumber(valueToSave);
        const displayValue = `${formatDanishNumber(rawValue)} DKK`;
        console.log(`SAVE OPERATION: Updating UI with formatted value: ${displayValue}`);
        
        const newData = [...tableData];
        newData[rowIndex][colIndex] = displayValue;
        setTableData(newData);
      }
      
      return true;
    } catch (error) {
      console.error("SAVE OPERATION: Error updating cell:", error);
      toast.error("Failed to save changes");
      return false;
    }
  };
  
  const refreshData = async () => {
    setIsRefreshing(true);
    setError(null);
    toast.info("Refreshing data from database...");
    
    try {
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
        
        const sortedTableData = sortTableData(tableData);
        
        setTableData(sortedTableData);
        toast.success("Data refreshed from database");
        setIsRefreshing(false);
        return true;
      }
      
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
