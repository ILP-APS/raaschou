
import { supabase } from "@/integrations/supabase/client";

export interface FokusarkTableRow {
  id?: string;
  [key: string]: any;
}

/**
 * Fetches all rows from the fokusark_table
 */
export async function fetchFokusarkTableData() {
  console.log('Fetching data from fokusark_table...');
  const { data, error } = await supabase
    .from('fokusark_table')
    .select('*');
    
  if (error) {
    console.error('Error fetching fokusark table data:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Saves a row to the fokusark_table
 */
export async function saveFokusarkTableRow(rowData: FokusarkTableRow) {
  console.log('Saving row to fokusark_table:', rowData);
  
  if (rowData.id) {
    // Update existing row
    const { data, error } = await supabase
      .from('fokusark_table')
      .update(rowData)
      .eq('id', rowData.id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating fokusark table row:', error);
      throw error;
    }
    
    return data;
  } else {
    // Insert new row
    const { data, error } = await supabase
      .from('fokusark_table')
      .insert([rowData])
      .select()
      .single();
      
    if (error) {
      console.error('Error inserting fokusark table row:', error);
      throw error;
    }
    
    return data;
  }
}

/**
 * Saves multiple rows to the fokusark_table in a batch
 */
export async function batchSaveFokusarkTableRows(rows: FokusarkTableRow[]) {
  console.log(`Batch saving ${rows.length} rows to fokusark_table`);
  
  // Separate rows into inserts (no id) and updates (with id)
  const insertRows = rows.filter(row => !row.id);
  const updateRows = rows.filter(row => row.id);
  
  const results = [];
  
  // Process inserts
  if (insertRows.length > 0) {
    const { data: insertedData, error: insertError } = await supabase
      .from('fokusark_table')
      .insert(insertRows)
      .select();
      
    if (insertError) {
      console.error('Error batch inserting fokusark table rows:', insertError);
      throw insertError;
    }
    
    results.push(...(insertedData || []));
  }
  
  // Process updates - one by one since we can't batch update different records
  for (const row of updateRows) {
    const { data: updatedData, error: updateError } = await supabase
      .from('fokusark_table')
      .update(row)
      .eq('id', row.id)
      .select()
      .single();
      
    if (updateError) {
      console.error(`Error updating fokusark table row ${row.id}:`, updateError);
      throw updateError;
    }
    
    if (updatedData) {
      results.push(updatedData);
    }
  }
  
  return results;
}

/**
 * Deletes a row from the fokusark_table
 */
export async function deleteFokusarkTableRow(id: string) {
  console.log('Deleting fokusark table row:', id);
  const { error } = await supabase
    .from('fokusark_table')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting fokusark table row:', error);
    throw error;
  }
  
  return true;
}

/**
 * Converts string[][] table data to fokusark_table row format
 */
export function convertTableDataToRowFormat(tableData: string[][]): FokusarkTableRow[] {
  return tableData.map((row, rowIndex) => {
    const rowObj: FokusarkTableRow = {};
    
    // Map each column to the corresponding "N col" field
    for (let colIndex = 0; colIndex < Math.min(row.length, 24); colIndex++) {
      rowObj[`${colIndex + 1} col`] = row[colIndex] || '';
    }
    
    return rowObj;
  });
}

/**
 * Converts fokusark_table rows back to string[][] format
 */
export function convertRowsToTableData(rows: FokusarkTableRow[]): string[][] {
  return rows.map(row => {
    const tableRow: string[] = [];
    
    // Extract values from "1 col" to "24 col"
    for (let i = 1; i <= 24; i++) {
      tableRow.push(row[`${i} col`] || '');
    }
    
    return tableRow;
  });
}
