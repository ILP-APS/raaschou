
import { FokusarkAppointment } from "@/api/fokusarkAppointmentsApi";
import { formatDanishNumber } from "@/utils/formatUtils";
import { Dispatch, SetStateAction } from 'react';

/**
 * Column indices for different table fields
 */
enum ColumnIndex {
  MATERIALER = 8,
  PROJEKTERING = 9,
  PRODUKTION = 10,
  MONTAGE = 11,
  TOTAL = 15,
  TIMER_TILBAGE = 16,
  PRODUKTION_TIMER_TILBAGE = 17
}

/**
 * Hook to handle UI updates after cell changes
 */
export const useUIUpdates = (
  tableData: string[][],
  setTableData: Dispatch<SetStateAction<string[][]>>
) => {
  /**
   * Generic function to update any cell in the table UI
   */
  const updateCellUI = (rowIndex: number, colIndex: number, value: string) => {
    setTableData(prevData => {
      const newData = [...prevData];
      if (rowIndex >= 0 && rowIndex < newData.length && colIndex >= 0) {
        const rowCopy = [...newData[rowIndex]];
        rowCopy[colIndex] = value;
        newData[rowIndex] = rowCopy;
        console.log(`Updated UI cell at row ${rowIndex}, column ${colIndex} with value: ${value}`);
      } else {
        console.warn(`Invalid row/column index for UI update: row=${rowIndex}, col=${colIndex}`);
      }
      return newData;
    });
  };
  
  /**
   * Update materialer cell from appointment data
   */
  const updateMaterialerUI = (rowIndex: number, updatedAppointment: FokusarkAppointment) => {
    if (updatedAppointment.materialer !== null) {
      updateCellUI(rowIndex, ColumnIndex.MATERIALER, formatDanishNumber(updatedAppointment.materialer || 0));
    }
  };
  
  /**
   * Update total cell from appointment data
   */
  const updateTotalUI = (rowIndex: number, updatedAppointment: FokusarkAppointment) => {
    if (updatedAppointment.total !== null) {
      updateCellUI(rowIndex, ColumnIndex.TOTAL, formatDanishNumber(updatedAppointment.total || 0));
    }
  };

  /**
   * Update produktion timer tilbage cell from appointment data
   */
  const updateProduktionTimerTilbageUI = (rowIndex: number, value: string | number) => {
    const formattedValue = typeof value === 'string' ? value : formatDanishNumber(value);
    console.log(`Updating Produktion Timer Tilbage UI at row ${rowIndex} with value: ${formattedValue}`);
    updateCellUI(rowIndex, ColumnIndex.PRODUKTION_TIMER_TILBAGE, formattedValue);
  };
  
  return {
    updateCellUI,
    updateMaterialerUI,
    updateTotalUI,
    // Aliases for specific column updates to maintain backward compatibility
    updateProjekteringUI: (rowIndex: number, value: string) => 
      updateCellUI(rowIndex, ColumnIndex.PROJEKTERING, value),
    updateProduktionUI: (rowIndex: number, value: string) => 
      updateCellUI(rowIndex, ColumnIndex.PRODUKTION, value),
    updateMontageUI: (rowIndex: number, value: string) => 
      updateCellUI(rowIndex, ColumnIndex.MONTAGE, value),
    updateTimerTilbageUI: (rowIndex: number, value: string) => 
      updateCellUI(rowIndex, ColumnIndex.TIMER_TILBAGE, value),
    updateProduktionTimerTilbageUI
  };
};
