
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { loadSavedCells, updateCellValue } from "@/services/fokusarkService";

export interface FokusarkTableData {
  data: string[][];
  isLoading: boolean;
}

export const useFokusarkTable = (initialData: string[][]) => {
  const [tableData, setTableData] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Calculate Materialer based on the updated formula and column preference:
  // If Montage 2 and Underleverandør 2 have values, use them, otherwise use the original columns
  // Formula: ((Tilbud - Montage) - Underleverandør) * 0.25
  const calculateMaterialer = (row: string[]): string => {
    try {
      // Get values from relevant columns
      const tilbud = parseFloat(row[3]?.replace(/\./g, '').replace(',', '.') || '0');
      
      // Check if Montage 2 (index 6) has a value, otherwise use Montage (index 4)
      const montageValue = row[6] && row[6].trim() !== '' 
        ? parseFloat(row[6]?.replace(/\./g, '').replace(',', '.') || '0')
        : parseFloat(row[4]?.replace(/\./g, '').replace(',', '.') || '0');
      
      // Check if Underleverandør 2 (index 7) has a value, otherwise use Underleverandør (index 5)
      const underleverandorValue = row[7] && row[7].trim() !== '' 
        ? parseFloat(row[7]?.replace(/\./g, '').replace(',', '.') || '0')
        : parseFloat(row[5]?.replace(/\./g, '').replace(',', '.') || '0');
      
      // Calculate using the formula: ((Tilbud - Montage) - Underleverandør) * 0.25
      const materialer = ((tilbud - montageValue) - underleverandorValue) * 0.25;
      
      // Format the result with the Danish number format
      return materialer.toLocaleString('da-DK');
    } catch (error) {
      console.error('Error calculating Materialer:', error);
      return '0';
    }
  };
  
  // Apply Materialer calculation to all rows
  const applyMaterialerCalculations = (data: string[][]): string[][] => {
    return data.map(row => {
      const rowCopy = [...row];
      // Materialer is at index 8
      rowCopy[8] = calculateMaterialer(row);
      return rowCopy;
    });
  };
  
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
      const columnName = colIndex === 6 ? "Montage 2" : "Underleverandør 2";
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
