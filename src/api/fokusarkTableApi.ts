
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
    // Check if fokusark_table exists
    const { data: tableInfo, error: tableCheckError } = await supabase
      .from('fokusark_table')
      .select('id')
      .limit(1);
      
    // If table doesn't exist or error, return empty array
    if (tableCheckError || !tableInfo) {
      console.log('No fokusark_table found or error fetching table:', tableCheckError);
      return [];
    }
    
    const { data, error } = await supabase
      .from('fokusark_table')
      .select('*')
      .order('id');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching fokusark table data:', error);
    return []; // Return empty array on error
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
    
    // For non-existent tables, this operation will gracefully fail
    // but we need to handle the error gracefully
    try {
      // Check if row already exists
      const { data: existingData, error: fetchError } = await supabase
        .from('fokusark_table')
        .select('id')
        .eq('id', row.id);
        
      if (fetchError) {
        console.log('Error checking for existing row:', fetchError);
        return null;
      }
      
      let result;
      
      if (existingData && existingData.length > 0) {
        // Update existing row
        const { data, error } = await supabase
          .from('fokusark_table')
          .update(row)
          .eq('id', row.id)
          .select()
          .single();
          
        if (error) {
          console.log('Error updating row:', error);
          return null;
        }
        result = data;
      } else {
        // Insert new row
        const { data, error } = await supabase
          .from('fokusark_table')
          .insert([row])
          .select()
          .single();
          
        if (error) {
          console.log('Error inserting row:', error);
          return null;
        }
        result = data;
      }
      
      return result;
    } catch (error) {
      console.error('Error with database operation:', error);
      return null;
    }
  } catch (error) {
    console.error('Error saving fokusark table row:', error);
    return null;
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
    
    try {
      // For non-existent tables, this operation will fail gracefully
      const { data, error } = await supabase
        .from('fokusark_table')
        .upsert(rows, { onConflict: 'id' })
        .select();
        
      if (error) {
        console.log('Error in batch save:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Database error in batch save:', error);
      return [];
    }
  } catch (error) {
    console.error('Error batch saving fokusark table rows:', error);
    return [];
  }
}

/**
 * Deletes a row from the fokusark_table
 */
export async function deleteFokusarkTableRow(id: string) {
  try {
    try {
      const { error } = await supabase
        .from('fokusark_table')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.log('Error deleting row:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Database error deleting row:', error);
      return false;
    }
  } catch (error) {
    console.error('Error deleting fokusark table row:', error);
    return false;
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
