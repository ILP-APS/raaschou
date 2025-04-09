
import { FokusarkAppointment } from "@/api/fokusarkAppointmentsApi";
import { Dispatch, SetStateAction } from 'react';
import { useUIUpdates } from "./useUIUpdates";
import { useCellValueUpdates } from "./useCellValueUpdates";
import { useRecalculationHandler } from "./useRecalculationHandler";
import { formatPercentageInput } from "@/utils/fokusarkCalculations";

interface UseCellChangeProps {
  tableData: string[][],
  setTableData: Dispatch<SetStateAction<string[][]>>,
  setAppointments: Dispatch<SetStateAction<FokusarkAppointment[]>>
}

/**
 * Hook to handle cell value changes
 */
export const useCellChange = ({
  tableData,
  setTableData,
  setAppointments
}: UseCellChangeProps) => {
  const { updateCellUI } = useUIUpdates(tableData, setTableData);
  const { updateCellValueInDb, isPercentageColumn } = useCellValueUpdates({ setAppointments, setTableData });
  const { handleRecalculations } = useRecalculationHandler({ tableData, setTableData });
  
  const handleCellChange = async (rowIndex: number, colIndex: number, value: string) => {
    const appointmentNumber = tableData[rowIndex][0];
    console.log(`Updating value for appointment ${appointmentNumber}, column ${colIndex}, new value: ${value}`);
    
    // For percentage columns, ensure the value is formatted and capped at 100%
    if (isPercentageColumn(colIndex)) {
      value = formatPercentageInput(value);
    }
    
    // Update the UI immediately for responsiveness
    updateCellUI(rowIndex, colIndex, value);
    
    try {
      // Update cell value in database
      await updateCellValueInDb(appointmentNumber, colIndex, value);
      
      // Create an updated row for recalculations
      const updatedRow = [...tableData[rowIndex]];
      updatedRow[colIndex] = value;
      
      // Handle all needed recalculations
      await handleRecalculations(appointmentNumber, rowIndex, colIndex, updatedRow);
    } catch (error) {
      console.error(`Error handling cell change for appointment ${appointmentNumber}:`, error);
    }
  };
  
  return { handleCellChange };
};
