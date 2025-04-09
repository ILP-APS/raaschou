
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
  
  // Calculate Est 1 based on the formula: (Tilbud - Montage) - Underleverandør * 0.25
  const calculateEst1 = (row: string[]): string => {
    try {
      // Get values from relevant columns (indices 3, 4, 5 for Tilbud, Montage, Underleverandør)
      const tilbud = parseFloat(row[3]?.replace(/\./g, '').replace(',', '.') || '0');
      const montage = parseFloat(row[4]?.replace(/\./g, '').replace(',', '.') || '0');
      const underleverandor = parseFloat(row[5]?.replace(/\./g, '').replace(',', '.') || '0');
      
      // Calculate using the formula
      const est1 = (tilbud - montage) - (underleverandor * 0.25);
      
      // Format the result with the Danish number format
      return est1.toLocaleString('da-DK');
    } catch (error) {
      console.error('Error calculating Est 1:', error);
      return '0';
    }
  };
  
  // Apply Est 1 calculation to all rows
  const applyEst1Calculations = (data: string[][]): string[][] => {
    return data.map(row => {
      const rowCopy = [...row];
      // Est 1 is at index 8
      rowCopy[8] = calculateEst1(row);
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
        
        // Apply Est 1 calculations to all rows
        const dataWithEst1 = applyEst1Calculations(dataToUse);
        
        setTableData(dataWithEst1);
      } catch (error) {
        console.error('Error loading saved cell data:', error);
        toast({
          title: "Error loading data",
          description: "Could not load saved data. Using default values.",
          variant: "destructive",
        });
        
        // Even with the error, apply Est 1 calculations
        const dataWithEst1 = applyEst1Calculations(initialData);
        setTableData(dataWithEst1);
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
      
      // If we're updating any of the columns used in Est 1 calculation (Tilbud, Montage, Underleverandør),
      // we need to recalculate Est 1
      if (colIndex === 3 || colIndex === 4 || colIndex === 5) {
        rowCopy[8] = calculateEst1(rowCopy);
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
