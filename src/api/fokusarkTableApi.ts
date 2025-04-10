
import { supabase } from "@/integrations/supabase/client";

export interface FokusarkTableRow {
  id?: string;
  [key: string]: any;
}

/**
 * Fetches all data from the fokusark_table
 */
export async function fetchFokusarkTableData() {
  try {
    const { data, error } = await supabase
      .from('fokusark_table')
      .select('*')
      .order('id');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching fokusark table data:', error);
    throw error;
  }
}

/**
 * Saves a row to the fokusark_table
 */
export async function saveFokusarkTableRow(row: FokusarkTableRow) {
  try {
    if (!row.id) {
      throw new Error('Row ID is required for saving');
    }
    
    // Check if row already exists
    const { data: existingData, error: fetchError } = await supabase
      .from('fokusark_table')
      .select('id')
      .eq('id', row.id);
      
    if (fetchError) throw fetchError;
    
    let result;
    
    if (existingData && existingData.length > 0) {
      // Update existing row
      const { data, error } = await supabase
        .from('fokusark_table')
        .update(row)
        .eq('id', row.id)
        .select()
        .single();
        
      if (error) throw error;
      result = data;
    } else {
      // Insert new row
      const { data, error } = await supabase
        .from('fokusark_table')
        .insert([row])
        .select()
        .single();
        
      if (error) throw error;
      result = data;
    }
    
    return result;
  } catch (error) {
    console.error('Error saving fokusark table row:', error);
    throw error;
  }
}

/**
 * Batch saves multiple rows to the fokusark_table
 */
export async function batchSaveFokusarkTableRows(rows: FokusarkTableRow[]) {
  try {
    // Ensure all rows have IDs
    rows.forEach((row, index) => {
      if (!row.id) {
        row.id = index.toString();
      }
    });
    
    // We'll use upsert to handle both insert and update cases
    const { data, error } = await supabase
      .from('fokusark_table')
      .upsert(rows, { onConflict: 'id' })
      .select();
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error batch saving fokusark table rows:', error);
    throw error;
  }
}

/**
 * Deletes a row from the fokusark_table
 */
export async function deleteFokusarkTableRow(id: string) {
  try {
    const { error } = await supabase
      .from('fokusark_table')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting fokusark table row:', error);
    throw error;
  }
}

/**
 * Utility function to convert table data to row format
 */
export function convertTableDataToRowFormat(tableData: string[][]): FokusarkTableRow[] {
  return tableData.map((row, rowIndex) => {
    const rowObj: FokusarkTableRow = { id: rowIndex.toString() };
    
    row.forEach((cellValue, colIndex) => {
      rowObj[`${colIndex + 1} col`] = cellValue;
    });
    
    return rowObj;
  });
}

/**
 * Utility function to convert rows to table data format
 */
export function convertRowsToTableData(rows: FokusarkTableRow[]): string[][] {
  const maxCols = 24; // Match the number of columns in the table
  
  return rows.map(row => {
    const rowData: string[] = Array(maxCols).fill('');
    
    for (let i = 0; i < maxCols; i++) {
      const colKey = `${i + 1} col`;
      if (row[colKey] !== undefined) {
        rowData[i] = row[colKey];
      }
    }
    
    return rowData;
  });
}
