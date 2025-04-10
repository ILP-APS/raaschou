
import { FokusarkAppointment } from "@/api/fokusarkAppointmentsApi";
import { Dispatch, SetStateAction, useRef } from 'react';
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
  
  // Add a debouncing mechanism to prevent multiple updates
  const pendingUpdatesRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  
  const handleCellChange = async (rowIndex: number, colIndex: number, value: string) => {
    if (rowIndex < 0 || rowIndex >= tableData.length) {
      console.error(`Invalid row index: ${rowIndex}`);
      return;
    }
    
    const appointmentNumber = tableData[rowIndex][0];
    const updateKey = `${appointmentNumber}-${colIndex}`;
    
    console.log(`Updating value for appointment ${appointmentNumber}, column ${colIndex}, new value: ${value}`);
    
    // For percentage columns, ensure the value is formatted and capped at 100%
    if (isPercentageColumn(colIndex)) {
      value = formatPercentageInput(value);
    }
    
    // Update the UI immediately for responsiveness
    updateCellUI(rowIndex, colIndex, value);
    
    // Clear any pending update for this cell
    if (pendingUpdatesRef.current.has(updateKey)) {
      clearTimeout(pendingUpdatesRef.current.get(updateKey));
      pendingUpdatesRef.current.delete(updateKey);
    }
    
    // Set a new timeout for this update
    pendingUpdatesRef.current.set(updateKey, setTimeout(async () => {
      try {
        // Update cell value in database
        const updatedAppointment = await updateCellValueInDb(appointmentNumber, colIndex, value);
        
        if (updatedAppointment) {
          // Create an updated row for recalculations
          const updatedRow = [...tableData[rowIndex]];
          updatedRow[colIndex] = value;
          
          // Handle all needed recalculations
          await handleRecalculations(appointmentNumber, rowIndex, colIndex, updatedRow);
        }
        
        pendingUpdatesRef.current.delete(updateKey);
      } catch (error) {
        console.error(`Error handling cell change for appointment ${appointmentNumber}:`, error);
        pendingUpdatesRef.current.delete(updateKey);
      }
    }, 300)); // 300ms debounce
  };
  
  return { handleCellChange };
};
