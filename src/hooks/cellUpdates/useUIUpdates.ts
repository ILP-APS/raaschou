
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
        // Update the total column (index 15)
        rowCopy[15] = formatDanishNumber(updatedAppointment.total || 0);
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

  // Update timer tilbage cell in the UI
  const updateTimerTilbageUI = (rowIndex: number, value: string) => {
    setTableData(prevData => {
      const newData = [...prevData];
      const rowCopy = [...newData[rowIndex]];
      // Update the timer tilbage column (index 18)
      rowCopy[18] = value;
      newData[rowIndex] = rowCopy;
      return newData;
    });
  };
  
  // Update projektering rest cell in the UI
  const updateProjekteringRestUI = (rowIndex: number, value: string) => {
    setTableData(prevData => {
      const newData = [...prevData];
      const rowCopy = [...newData[rowIndex]];
      // Update the projektering rest column (index 16)
      rowCopy[16] = value;
      newData[rowIndex] = rowCopy;
      return newData;
    });
  };
  
  // Update produktion rest cell in the UI
  const updateProduktionRestUI = (rowIndex: number, value: string) => {
    setTableData(prevData => {
      const newData = [...prevData];
      const rowCopy = [...newData[rowIndex]];
      // Update the produktion rest column (index 17)
      rowCopy[17] = value;
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
    updateTimerTilbageUI,
    updateProjekteringRestUI,
    updateProduktionRestUI,
    updateCellUI
  };
};
