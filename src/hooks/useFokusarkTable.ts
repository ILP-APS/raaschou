
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
  
  // Calculate Materialer based on the formula: ((Tilbud - Montage) - Underleverandør) * 0.25
  // If Montage 2 and Underleverandør 2 have numeric values, use them, otherwise use the original columns
  const calculateMaterialer = (row: string[]): string => {
    try {
      console.log("Calculating Materialer for row:", JSON.stringify(row));
      
      // Get values from relevant columns
      const tilbudStr = row[3] || '0';
      const montageStr = row[4] || '0';
      const underleverandorStr = row[5] || '0';
      const montage2Str = row[6] || '';
      const underleverandor2Str = row[7] || '';
      
      console.log("Raw values:", {
        tilbud: tilbudStr,
        montage: montageStr,
        underleverandor: underleverandorStr,
        montage2: montage2Str,
        underleverandor2: underleverandor2Str
      });
      
      // Helper function to properly parse Danish number format
      const parseNumber = (value: string): number => {
        if (!value || value.trim() === '') return 0;
        
        // Check if the value looks like a real number format (contains digits)
        if (!/\d/.test(value)) return 0;
        
        // Remove periods (thousands separators in Danish) and replace comma with dot
        const cleanValue = value.replace(/\./g, '').replace(',', '.');
        const result = parseFloat(cleanValue);
        return isNaN(result) ? 0 : result;
      };
      
      // Parse all values to numbers
      const tilbud = parseNumber(tilbudStr);
      const montage = parseNumber(montageStr);
      const underleverandor = parseNumber(underleverandorStr);
      const montage2 = parseNumber(montage2Str);
      const underleverandor2 = parseNumber(underleverandor2Str);
      
      console.log("Parsed values:", {
        tilbud,
        montage,
        underleverandor,
        montage2,
        underleverandor2
      });
      
      // Determine which values to use in calculation
      // Only use Montage 2 and Underleverandør 2 if they are actual numbers (not placeholders like "R1C7")
      const useMontage2 = montage2Str && /\d/.test(montage2Str);
      const useUnderleverandor2 = underleverandor2Str && /\d/.test(underleverandor2Str);
      
      const montageValue = useMontage2 ? montage2 : montage;
      const underleverandorValue = useUnderleverandor2 ? underleverandor2 : underleverandor;
      
      console.log("Using values:", {
        tilbud,
        montage: montageValue,
        underleverandor: underleverandorValue,
        useMontage2,
        useUnderleverandor2
      });
      
      // Calculate using the formula: ((Tilbud - Montage) - Underleverandør) * 0.25
      const materialer = ((tilbud - montageValue) - underleverandorValue) * 0.25;
      
      console.log("Materialer calculation result:", materialer);
      
      // Check for NaN and return '0' if the calculation resulted in NaN
      if (isNaN(materialer)) {
        console.log("Result is NaN, returning 0");
        return '0';
      }
      
      // Format the result with the Danish number format (comma as decimal separator, period as thousands separator)
      return materialer.toLocaleString('da-DK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
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
