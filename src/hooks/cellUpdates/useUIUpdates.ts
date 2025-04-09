import { FokusarkAppointment } from "@/api/fokusarkAppointmentsApi";
import { formatDanishNumber } from "@/utils/formatUtils";
import { Dispatch, SetStateAction } from 'react';

/**
 * Hook to handle UI updates after cell changes
 */
export const useUIUpdates = (
  tableData: string[][],
  setTableData: Dispatch<SetStateAction<string[][]>>
) => {
  // Update materialer cell in the UI
  const updateMaterialerUI = (rowIndex: number, updatedAppointment: FokusarkAppointment) => {
    if (updatedAppointment.materialer !== null) {
      setTableData(prevData => {
        const newData = [...prevData];
        const rowCopy = [...newData[rowIndex]];
        // Update the materialer column (index 8)
        rowCopy[8] = formatDanishNumber(updatedAppointment.materialer || 0);
        newData[rowIndex] = rowCopy;
        return newData;
      });
    }
  };
  
  // Update total cell in the UI
  const updateTotalUI = (rowIndex: number, updatedAppointment: FokusarkAppointment) => {
    if (updatedAppointment.total !== null) {
      setTableData(prevData => {
        const newData = [...prevData];
        const rowCopy = [...newData[rowIndex]];
        // Update the total column (index 12)
        rowCopy[12] = formatDanishNumber(updatedAppointment.total || 0);
        newData[rowIndex] = rowCopy;
        return newData;
      });
    }
  };
  
  // Update projektering cell in the UI
  const updateProjekteringUI = (rowIndex: number, value: string) => {
    setTableData(prevData => {
      const newData = [...prevData];
      const rowCopy = [...newData[rowIndex]];
      // Update the projektering column (index 9)
      rowCopy[9] = value;
      newData[rowIndex] = rowCopy;
      return newData;
    });
  };
  
  // Update produktion cell in the UI
  const updateProduktionUI = (rowIndex: number, value: string) => {
    setTableData(prevData => {
      const newData = [...prevData];
      const rowCopy = [...newData[rowIndex]];
      // Update the produktion column (index 10)
      rowCopy[10] = value;
      newData[rowIndex] = rowCopy;
      return newData;
    });
  };
  
  // Update montage cell in the UI
  const updateMontageUI = (rowIndex: number, value: string) => {
    setTableData(prevData => {
      const newData = [...prevData];
      const rowCopy = [...newData[rowIndex]];
      // Update the montage column (index 11)
      rowCopy[11] = value;
      newData[rowIndex] = rowCopy;
      return newData;
    });
  };
  
  // Update a cell value directly
  const updateCellUI = (rowIndex: number, colIndex: number, value: string) => {
    setTableData(prevData => {
      const newData = [...prevData];
      const rowCopy = [...newData[rowIndex]];
      rowCopy[colIndex] = value;
      newData[rowIndex] = rowCopy;
      return newData;
    });
  };
  
  return {
    updateMaterialerUI,
    updateTotalUI,
    updateProjekteringUI,
    updateProduktionUI,
    updateMontageUI,
    updateCellUI
  };
};
