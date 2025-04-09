
import { supabase } from "@/integrations/supabase/client";

export interface FokusarkCellData {
  id?: number;
  row_index: number;
  col_index: number;
  value: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetches all saved cell data from Supabase
 */
export async function fetchSavedCells() {
  // Use type assertion to work around type issues
  const { data, error } = await supabase
    .from('fokusark_cells')
    .select('*') as unknown as { 
      data: FokusarkCellData[] | null; 
      error: Error | null;
    };
    
  if (error) throw error;
  return data as FokusarkCellData[];
}

/**
 * Updates or creates a cell value in Supabase
 */
export async function saveCellValue(rowIndex: number, colIndex: number, value: string) {
  // Check if a record already exists for this cell
  const { data: existingData, error: fetchError } = await supabase
    .from('fokusark_cells')
    .select('id')
    .eq('row_index', rowIndex)
    .eq('col_index', colIndex) as unknown as {
      data: { id: number }[] | null;
      error: Error | null;
    };
    
  if (fetchError) throw fetchError;
  
  if (existingData && existingData.length > 0) {
    // Update existing record
    const { error } = await supabase
      .from('fokusark_cells')
      .update({ value })
      .eq('id', existingData[0].id) as unknown as {
        error: Error | null;
      };
      
    if (error) throw error;
    
    return { id: existingData[0].id, updated: true };
  } else {
    // Insert new record
    const { data, error } = await supabase
      .from('fokusark_cells')
      .insert([{ row_index: rowIndex, col_index: colIndex, value }])
      .select('id')
      .single() as unknown as {
        data: { id: number } | null;
        error: Error | null;
      };
      
    if (error) throw error;
    
    return { id: data?.id, updated: false };
  }
}

/**
 * Batch imports multiple cell values at once
 */
export async function batchImportCells(cells: Omit<FokusarkCellData, 'id' | 'created_at' | 'updated_at'>[]) {
  const { data, error } = await supabase
    .from('fokusark_cells')
    .upsert(
      cells.map(cell => ({
        row_index: cell.row_index,
        col_index: cell.col_index,
        value: cell.value
      })),
      { onConflict: 'row_index,col_index' }
    ) as unknown as {
      data: any | null;
      error: Error | null;
    };
    
  if (error) throw error;
  return data;
}
