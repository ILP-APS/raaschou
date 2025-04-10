
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { 
  fetchFokusarkTableData, 
  saveFokusarkTableRow,
  batchSaveFokusarkTableRows,
  deleteFokusarkTableRow,
  convertTableDataToRowFormat,
  convertRowsToTableData,
  FokusarkTableRow
} from "@/api/fokusarkTableApi";
import { generateTableData } from "@/utils/tableData";

/**
 * Hook to interact with the fokusark_table in Supabase
 */
export const useFokusarkDb = () => {
  const [tableData, setTableData] = useState<string[][]>([]);
  const [supabaseRows, setSupabaseRows] = useState<FokusarkTableRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load data from Supabase when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Try to load data from Supabase
        const rows = await fetchFokusarkTableData();
        console.log(`Loaded ${rows.length} rows from fokusark_table`);
        
        if (rows.length > 0) {
          // Convert rows to table data format
          const data = convertRowsToTableData(rows);
          setTableData(data);
          setSupabaseRows(rows);
          toast.success(`Loaded ${rows.length} rows from database`);
        } else {
          // If no data in Supabase, generate sample data
          console.log("No data in fokusark_table, generating sample data");
          const sampleData = generateTableData(24);
          setTableData(sampleData);
          
          // Save sample data to Supabase
          try {
            const rowsToSave = convertTableDataToRowFormat(sampleData);
            const savedRows = await batchSaveFokusarkTableRows(rowsToSave);
            console.log(`Saved ${savedRows.length} sample rows to fokusark_table`);
            setSupabaseRows(savedRows);
            toast.success(`Initialized database with ${savedRows.length} rows`);
          } catch (saveError) {
            console.error("Error saving sample data:", saveError);
            toast.error("Failed to save sample data to database");
          }
        }
      } catch (err) {
        console.error("Error loading data from fokusark_table:", err);
        setError("Failed to load data from database");
        
        // Fallback to sample data
        const sampleData = generateTableData(24);
        setTableData(sampleData);
        toast.error("Failed to load data from database, using sample data");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Function to save changes to a specific cell
  const saveCellChange = useCallback(async (
    rowIndex: number,
    colIndex: number,
    value: string
  ) => {
    try {
      if (rowIndex >= supabaseRows.length) {
        throw new Error(`Invalid row index: ${rowIndex}`);
      }
      
      if (colIndex < 0 || colIndex >= 24) {
        throw new Error(`Invalid column index: ${colIndex}`);
      }
      
      const row = supabaseRows[rowIndex];
      const columnName = `${colIndex + 1} col`;
      
      // Update the row object
      const updatedRow = {
        ...row,
        [columnName]: value
      };
      
      // Save to Supabase
      const savedRow = await saveFokusarkTableRow(updatedRow);
      console.log("Saved cell change:", savedRow);
      
      // Update local state
      const newSupabaseRows = [...supabaseRows];
      newSupabaseRows[rowIndex] = savedRow;
      setSupabaseRows(newSupabaseRows);
      
      // Update table data
      const newTableData = [...tableData];
      newTableData[rowIndex][colIndex] = value;
      setTableData(newTableData);
      
      toast.success("Cell updated successfully");
      return true;
    } catch (err) {
      console.error("Error saving cell change:", err);
      toast.error("Failed to save cell change");
      return false;
    }
  }, [supabaseRows, tableData]);
  
  // Function to refresh data
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Generate new sample data
      const sampleData = generateTableData(24);
      
      // Convert to row format
      const rowsToSave = convertTableDataToRowFormat(sampleData);
      
      // Delete existing rows
      for (const row of supabaseRows) {
        if (row.id) {
          await deleteFokusarkTableRow(row.id);
        }
      }
      
      // Save new rows
      const savedRows = await batchSaveFokusarkTableRows(rowsToSave);
      
      // Update state
      setTableData(sampleData);
      setSupabaseRows(savedRows);
      
      toast.success("Data refreshed successfully");
    } catch (err) {
      console.error("Error refreshing data:", err);
      toast.error("Failed to refresh data");
    } finally {
      setIsLoading(false);
    }
  }, [supabaseRows]);
  
  return {
    tableData,
    isLoading,
    error,
    saveCellChange,
    refreshData
  };
};
