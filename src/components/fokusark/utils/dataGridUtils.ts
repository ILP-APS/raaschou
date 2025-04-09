
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
  return rawData.map((row, index) => {
    const rowObj: FokusarkRow = { id: index.toString() };
    
    // The last element in the raw data indicates if it's a sub-appointment
    const rowType = row[row.length - 1];
    rowObj.isSubAppointment = rowType === 'sub-appointment';
    
    // Map the columns to the rowObj
    const columnNames = getColumnDefinitions();
    for (let i = 0; i < Math.min(row.length - 1, columnNames.length); i++) {
      rowObj[columnNames[i].key] = row[i];
    }
    
    return rowObj;
  });
}

/**
 * Check if a column is editable
 */
export function isColumnEditable(columnKey: string): boolean {
  // Only these columns are editable: Montage 2, Underleverandør 2, Færdig % ex montage nu/før
  return ["montage2", "underleverandor2", "faerdig_pct_ex_montage_nu", "faerdig_pct_ex_montage_foer"].includes(columnKey);
}

/**
 * Get column definitions for the grid
 */
export function getColumnDefinitions(): Column<FokusarkRow, unknown>[] {
  return [
    { key: "nr", name: "Nr.", frozen: true, width: 80 },
    { key: "navn", name: "Navn", frozen: true, width: 250 },
    { key: "ansvarlig", name: "Ansvarlig", width: 120 },
    { key: "tilbud", name: "Tilbud", width: 120 },
    { key: "montage", name: "Montage", width: 120 },
    { key: "underleverandor", name: "Underleverandør", width: 120 },
    { key: "montage2", name: "Montage 2", width: 120 },
    { key: "underleverandor2", name: "Underleverandør 2", width: 120 },
    { key: "materialer", name: "Materialer", width: 120 },
    { key: "projektering", name: "Projektering", width: 120 },
    { key: "produktion", name: "Produktion", width: 120 },
    { key: "montage_3", name: "Montage", width: 120 },
    { key: "projektering_2", name: "Projektering", width: 120 },
    { key: "produktion_realized", name: "Produktion", width: 120 },
    { key: "montage_3_realized", name: "Montage", width: 120 },
    { key: "total", name: "Total", width: 120 },
    { key: "timer_tilbage_1", name: "Projektering", width: 120 },
    { key: "timer_tilbage_2", name: "Timer tilbage", width: 120 },
    { key: "faerdig_pct_ex_montage_nu", name: "Færdig % ex montage nu", width: 160 },
    { key: "faerdig_pct_ex_montage_foer", name: "Færdig % ex montage før", width: 160 },
    { key: "est_timer_ift_faerdig_pct", name: "Est timer ift færdig %", width: 150 },
    { key: "plus_minus_timer", name: "+/- timer", width: 120 },
    { key: "afsat_fragt", name: "Afsat fragt", width: 120 }
  ];
}

/**
 * Define column groups for the header
 */
export function getColumnGroups() {
  return [
    { name: "Aftale", columns: ["nr", "navn"] },
    { name: "Ansvarlig", columns: ["ansvarlig"] },
    { name: "TILBUD", columns: ["tilbud", "montage", "underleverandor", "montage2", "underleverandor2"] },
    { name: "Estimeret", columns: ["materialer", "projektering", "produktion", "montage_3"] },
    { name: "Realiseret", columns: ["projektering_2", "produktion_realized", "montage_3_realized", "total"] },
    { name: "Timer tilbage", columns: ["timer_tilbage_1"] },
    { name: "Produktion", columns: ["timer_tilbage_2", "faerdig_pct_ex_montage_nu", "faerdig_pct_ex_montage_foer", "est_timer_ift_faerdig_pct", "plus_minus_timer"] },
    { name: "Transport", columns: ["afsat_fragt"] }
  ];
}
