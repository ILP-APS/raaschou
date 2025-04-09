
import { supabase } from "@/integrations/supabase/client";
import { FokusarkCellData } from "@/api/fokusarkApi";
import { useToast } from "@/hooks/use-toast";

/**
 * Loads saved cell data from Supabase
 */
export const loadSavedCells = async () => {
  try {
    // Using any type here to work around the type issues
    const { data: savedCells, error } = await supabase
      .from('fokusark_cells')
      .select('*') as any;
    
    if (error) {
      throw error;
    }
    
    return savedCells as FokusarkCellData[];
  } catch (error) {
    console.error('Error loading saved cell data:', error);
    throw error;
  }
};

/**
 * Updates a cell value in Supabase
 */
export const updateCellValue = async (
  rowIndex: number, 
  colIndex: number, 
  value: string
): Promise<{success: boolean; error?: Error}> => {
  try {
    // Check if a record already exists for this cell
    const { data: existingData, error: fetchError } = await supabase
      .from('fokusark_cells')
      .select('*')
      .eq('row_index', rowIndex)
      .eq('col_index', colIndex) as any;
    
    if (fetchError) throw fetchError;
    
    let result;
    
    if (existingData && existingData.length > 0) {
      // Update existing record
      result = await supabase
        .from('fokusark_cells')
        .update({ value })
        .eq('row_index', rowIndex)
        .eq('col_index', colIndex) as any;
    } else {
      // Insert new record
      result = await supabase
        .from('fokusark_cells')
        .insert([{ row_index: rowIndex, col_index: colIndex, value }]) as any;
    }
    
    if (result.error) throw result.error;
    
    return { success: true };
  } catch (error) {
    console.error('Error saving cell data:', error);
    return { success: false, error: error as Error };
  }
};
