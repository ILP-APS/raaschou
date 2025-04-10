
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Updates a cell value in the fokusark_table
 */
export const updateCellValue = async (
  rowIndex: number, 
  colIndex: number, 
  value: string
): Promise<{success: boolean; error?: Error}> => {
  try {
    // Find the corresponding column name for the given colIndex
    const columnName = `${colIndex + 1} col`;
    
    // Check if a record already exists for this row
    const { data: existingData, error: fetchError } = await supabase
      .from('fokusark_table')
      .select('id')
      .eq('id', rowIndex.toString()) as any;
    
    if (fetchError) throw fetchError;
    
    let result;
    
    const updateData = {
      [columnName]: value
    };
    
    if (existingData && existingData.length > 0) {
      // Update existing record
      result = await supabase
        .from('fokusark_table')
        .update(updateData)
        .eq('id', existingData[0].id) as any;
    } else {
      // Insert new record
      const newRow = {
        id: rowIndex.toString(),
        ...updateData
      };
      
      result = await supabase
        .from('fokusark_table')
        .insert([newRow]) as any;
    }
    
    if (result.error) throw result.error;
    
    return { success: true };
  } catch (error) {
    console.error('Error saving cell data:', error);
    return { success: false, error: error as Error };
  }
};

/**
 * Loads saved cell data from fokusark_table
 */
export const loadSavedCells = async () => {
  try {
    const { data: savedCells, error } = await supabase
      .from('fokusark_table')
      .select('*') as any;
    
    if (error) {
      throw error;
    }
    
    return savedCells || [];
  } catch (error) {
    console.error('Error loading saved cell data:', error);
    throw error;
  }
};
