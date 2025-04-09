
import { Column } from "react-data-grid";

// Define the row type for our grid
export interface FokusarkRow {
  [key: string]: string | number | boolean;
  id: string;
  isSubAppointment?: boolean;
}

/**
 * Transform string[][] data into row objects for the grid
 */
export function transformDataToRows(rawData: string[][]): FokusarkRow[] {
  console.log("Transforming", rawData?.length || 0, "rows of raw data to grid format");
  
  return (rawData || []).map((row, index) => {
    const rowObj: FokusarkRow = { id: index.toString() };
    
    // The last element might indicate if it's a sub-appointment
    const rowType = row.length > 0 ? row[row.length - 1] : null;
    rowObj.isSubAppointment = rowType === 'sub-appointment';
    
    // Map the columns to the rowObj
    const columnNames = getColumnDefinitions();
    for (let i = 0; i < Math.min(row.length, columnNames.length); i++) {
      rowObj[columnNames[i].key] = row[i] || '';
    }
    
    return rowObj;
  });
}

/**
 * Check if a column is editable
 */
export function isColumnEditable(columnKey: string): boolean {
  // Only these columns are editable
  return ["montage2", "underleverandor2", "faerdig_pct_ex_montage_nu", "faerdig_pct_ex_montage_foer"].includes(columnKey);
}

/**
 * Get column definitions for the grid
 */
export function getColumnDefinitions(): Column<FokusarkRow, unknown>[] {
  return [
    { key: "nr", name: "Nr." },
    { key: "navn", name: "Navn" },
    { key: "ansvarlig", name: "Ansvarlig" },
    { key: "tilbud", name: "Tilbud" },
    { key: "montage", name: "Montage" },
    { key: "underleverandor", name: "Underleverandør" },
    { key: "montage2", name: "Montage 2" },
    { key: "underleverandor2", name: "Underleverandør 2" },
    { key: "materialer", name: "Materialer" },
    { key: "projektering", name: "Projektering" },
    { key: "produktion", name: "Produktion" },
    { key: "montage_3", name: "Montage" },
    { key: "projektering_2", name: "Projektering" },
    { key: "produktion_realized", name: "Produktion" },
    { key: "montage_3_realized", name: "Montage" },
    { key: "total", name: "Total" },
    { key: "timer_tilbage_1", name: "Projektering" },
    { key: "timer_tilbage_2", name: "Timer tilbage" },
    { key: "faerdig_pct_ex_montage_nu", name: "Færdig % ex montage nu" },
    { key: "faerdig_pct_ex_montage_foer", name: "Færdig % ex montage før" },
    { key: "est_timer_ift_faerdig_pct", name: "Est timer ift færdig %" },
    { key: "plus_minus_timer", name: "+/- timer" },
    { key: "afsat_fragt", name: "Afsat fragt" }
  ];
}
