import { FokusarkCellData } from '@/api/fokusarkApi';

// This file is now empty of real implementation since we removed Supabase tables
// It's kept as a placeholder for future implementation

export async function fetchAllSavedCells(): Promise<FokusarkCellData[]> {
  console.log("fetchAllSavedCells called but no implementation exists");
  return [];
}

export async function updateCellValue(
  rowIndex: number,
  colIndex: number,
  value: string
): Promise<FokusarkCellData | null> {
  console.log(`updateCellValue called for cell (${rowIndex}, ${colIndex}) with value ${value} but no implementation exists`);
  return null;
}

export async function importBatchCellValues(
  cells: { row_index: number; col_index: number; value: string }[]
): Promise<FokusarkCellData[] | null> {
  console.log(`importBatchCellValues called with ${cells.length} cells but no implementation exists`);
  return null;
}
