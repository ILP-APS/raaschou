import { FokusarkAppointment } from "@/api/fokusarkAppointmentsApi";
import { Dispatch, SetStateAction, useRef } from 'react';
import { useUIUpdates } from "./useUIUpdates";
import { useCellValueUpdates } from "./useCellValueUpdates";
import { useRecalculationHandler } from "./useRecalculationHandler";
import { formatPercentageInput } from "@/utils/fokusarkCalculations";
import { parseNumber } from "@/utils/numberFormatUtils";

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
  const { updateCellValueInDb, isPercentageColumn, isCurrencyColumn } = useCellValueUpdates({ setAppointments, setTableData });
  const { handleRecalculations } = useRecalculationHandler({ tableData, setTableData });
  
  // Add a debouncing mechanism to prevent multiple updates
  const pendingUpdatesRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  // Track which cells are currently being edited to prevent UI flickering
  const editingCellsRef = useRef<Set<string>>(new Set());
  
  const handleCellChange = async (rowIndex: number, colIndex: number, value: string) => {
    if (rowIndex < 0 || rowIndex >= tableData.length) {
      console.error(`Invalid row index: ${rowIndex}`);
      return;
    }
    
    const appointmentNumber = tableData[rowIndex][0];
    const updateKey = `${appointmentNumber}-${colIndex}`;
    
    console.log(`Handling cell change for appointment ${appointmentNumber}, column ${colIndex}, new value: ${value}`);
    
    // Mark this cell as being edited
    editingCellsRef.current.add(updateKey);
    
    // For percentage columns, ensure the value is formatted and capped at 100%
    if (isPercentageColumn(colIndex)) {
      value = formatPercentageInput(value);
    }
    
    // Update the UI immediately for responsiveness, but only if not editing anymore
    // This prevents the UI from flickering while typing
    if (!editingCellsRef.current.has(updateKey)) {
      updateCellUI(rowIndex, colIndex, value);
    }
    
    // Clear any pending update for this cell
    if (pendingUpdatesRef.current.has(updateKey)) {
      clearTimeout(pendingUpdatesRef.current.get(updateKey));
      pendingUpdatesRef.current.delete(updateKey);
    }
    
    // Update UI immediately without triggering the database update
    updateCellUI(rowIndex, colIndex, value);
  };

  const handleCellBlur = async (rowIndex: number, colIndex: number, value: string) => {
    if (rowIndex < 0 || rowIndex >= tableData.length) {
      console.error(`Invalid row index: ${rowIndex}`);
      return;
    }
    
    const appointmentNumber = tableData[rowIndex][0];
    const updateKey = `${appointmentNumber}-${colIndex}`;
    
    console.log(`Finalizing cell update for appointment ${appointmentNumber}, column ${colIndex}, value: ${value}`);
    
    try {
      // For currency columns, ensure proper parsing
      if (isCurrencyColumn(colIndex)) {
        // First check if the input is a plain number with no separators
        if (/^\d+$/.test(value)) {
          const numericValue = parseInt(value, 10);
          console.log(`Parsed plain number for blur event: ${value} -> ${numericValue}`);
          value = String(numericValue);
        } else {
          // Otherwise parse using our utility function
          try {
            const numericValue = parseNumber(value);
            console.log(`Parsed formatted number for blur event: ${value} -> ${numericValue}`);
            value = String(numericValue);
          } catch (e) {
            console.error(`Error parsing number for column ${colIndex}:`, e);
          }
        }
      }
      
      // Remove currency suffix if present before saving
      const cleanValue = value.replace(/ DKK$/, '');
      console.log(`Final value being sent to database: "${cleanValue}"`);
      
      // Update cell value in database
      const updatedAppointment = await updateCellValueInDb(appointmentNumber, colIndex, cleanValue);
      
      if (updatedAppointment) {
        // Create an updated row for recalculations
        const updatedRow = [...tableData[rowIndex]];
        updatedRow[colIndex] = cleanValue;
        
        // Handle all needed recalculations
        await handleRecalculations(appointmentNumber, rowIndex, colIndex, updatedRow);
      }
      
      // Mark this cell as no longer being edited
      editingCellsRef.current.delete(updateKey);
    } catch (error) {
      console.error(`Error handling cell change for appointment ${appointmentNumber}:`, error);
      editingCellsRef.current.delete(updateKey);
    }
  };
  
  return { handleCellChange, handleCellBlur };
};
