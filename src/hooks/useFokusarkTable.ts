
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { loadSavedCells, updateCellValue } from "@/services/fokusarkService";
import { calculateMaterialer, applyMaterialerCalculations } from "@/utils/fokusarkCalculations";

export interface FokusarkTableData {
  data: string[][];
  isLoading: boolean;
}

export const useFokusarkTable = (initialData: string[][]) => {
  const [tableData, setTableData] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Load data and saved values from Supabase when component mounts
  useEffect(() => {
    async function fetchSavedData() {
      if (!initialData.length) return;
      
      // Get fresh copy of data
      const dataToUse = [...initialData];
      
      try {
        setIsLoading(true);
        // Fetch saved values from Supabase
        const savedCells = await loadSavedCells();
        
        if (savedCells && savedCells.length > 0) {
          // Apply saved values to the data
          savedCells.forEach((cell) => {
            const { row_index, col_index, value } = cell;
            if (row_index < dataToUse.length) {
              // Create a copy of the row if it exists
              const rowCopy = [...dataToUse[row_index]];
              rowCopy[col_index] = value;
              dataToUse[row_index] = rowCopy;
            }
          });
        }
        
        // Apply Materialer calculations to all rows
        const dataWithMaterialer = applyMaterialerCalculations(dataToUse);
        
        setTableData(dataWithMaterialer);
      } catch (error) {
        console.error('Error loading saved cell data:', error);
        toast({
          title: "Error loading data",
          description: "Could not load saved data. Using default values.",
          variant: "destructive",
        });
        
        // Even with the error, apply Materialer calculations
        const dataWithMaterialer = applyMaterialerCalculations(initialData);
        setTableData(dataWithMaterialer);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchSavedData();
  }, [initialData, toast]);
  
  // Handle cell value changes
  const handleCellChange = async (rowIndex: number, colIndex: number, value: string) => {
    // Update local state first for immediate feedback
    setTableData(prevData => {
      const newData = [...prevData];
      
      // Create a copy of the row
      const rowCopy = [...newData[rowIndex]];
      
      // Update the specific cell
      rowCopy[colIndex] = value;
      
      // If we're updating Montage 2, Underleverandør 2, Tilbud, Montage, or Underleverandør,
      // we need to recalculate Materialer
      if (colIndex === 3 || colIndex === 4 || colIndex === 5 || colIndex === 6 || colIndex === 7) {
        rowCopy[8] = calculateMaterialer(rowCopy);
      }
      
      // Update the row in the data
      newData[rowIndex] = rowCopy;
      
      return newData;
    });
    
    // Save to Supabase
    try {
      const result = await updateCellValue(rowIndex, colIndex, value);
      
      if (!result.success) throw result.error;
      
      // Show a toast notification
      let columnName = "Value";
      if (colIndex === 6) columnName = "Montage 2";
      else if (colIndex === 7) columnName = "Underleverandør 2";
      else if (colIndex === 3) columnName = "Tilbud";
      else if (colIndex === 4) columnName = "Montage";
      else if (colIndex === 5) columnName = "Underleverandør";
      
      toast({
        title: "Cell updated",
        description: `Updated ${columnName} value for row ${rowIndex + 1}`,
      });
    } catch (error) {
      console.error('Error saving cell data:', error);
      toast({
        title: "Error saving data",
        description: "Could not save your changes to the database. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return { tableData, isLoading, handleCellChange };
};
