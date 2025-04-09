
import { parseNumber, calculateTotal } from "@/utils/fokusarkCalculations";
import { updateAppointmentField } from "@/services/fokusarkAppointmentService";
import { useCalculations } from "./useCalculations";
import { useUIUpdates } from "./useUIUpdates";

interface UseRecalculationHandlerProps {
  tableData: string[][];
  setTableData: React.Dispatch<React.SetStateAction<string[][]>>;
}

/**
 * Hook to handle recalculation logic when cells are changed
 */
export const useRecalculationHandler = ({
  tableData,
  setTableData
}: UseRecalculationHandlerProps) => {
  const { 
    recalculateProjektering, 
    recalculateProduktion, 
    recalculateMontage, 
    recalculateTimerTilbage,
    recalculateProduktionTimerTilbage
  } = useCalculations();
  
  const { 
    updateProjekteringUI, 
    updateProduktionUI, 
    updateMontageUI,
    updateTimerTilbageUI,
    updateProjekteringRestUI,
    updateProduktionTimerTilbageUI
  } = useUIUpdates(tableData, setTableData);
  
  // Determine if field recalculation is needed based on cell change
  const shouldRecalculateFields = (colIndex: number) => {
    return {
      projektering: [3, 4, 6].includes(colIndex),
      produktion: [3, 4, 5, 6, 7, 8, 9].includes(colIndex),
      montage: [4, 6].includes(colIndex),
      timerTilbage: [9, 12].includes(colIndex),
      produktionTimerTilbage: [10, 13].includes(colIndex),
      total: [9, 10, 11].includes(colIndex)
    };
  };
  
  // Handle recalculation of all dependent fields
  const handleRecalculations = async (
    appointmentNumber: string,
    rowIndex: number,
    colIndex: number,
    updatedRow: string[]
  ) => {
    console.log(`Checking recalculations for appointment ${appointmentNumber}, column ${colIndex}`);
    
    const recalcNeeded = shouldRecalculateFields(colIndex);
    
    // Create a copy of the row data that we'll update with recalculated values
    const newRowData = [...updatedRow];
    
    // Recalculate projektering if needed
    if (recalcNeeded.projektering) {
      console.log(`Need to recalculate Projektering for ${appointmentNumber}`);
      try {
        const { projekteringValue } = await recalculateProjektering(appointmentNumber, newRowData);
        updateProjekteringUI(rowIndex, projekteringValue);
        newRowData[9] = projekteringValue;
        
        // Also recalculate timer tilbage if projektering changed
        const { timerTilbageValue } = await recalculateTimerTilbage(appointmentNumber, newRowData);
        updateProjekteringRestUI(rowIndex, timerTilbageValue);
        newRowData[16] = timerTilbageValue;
      } catch (error) {
        console.error(`Failed to recalculate projektering for ${appointmentNumber}:`, error);
      }
    }
    
    // Recalculate produktion if needed
    if (recalcNeeded.produktion) {
      console.log(`Need to recalculate Produktion for ${appointmentNumber}`);
      try {
        const { produktionValue } = await recalculateProduktion(appointmentNumber, newRowData);
        updateProduktionUI(rowIndex, produktionValue);
        newRowData[10] = produktionValue;
        
        // Also recalculate produktion timer tilbage if produktion changed
        const { produktionTimerTilbageValue } = await recalculateProduktionTimerTilbage(appointmentNumber, newRowData);
        updateProduktionTimerTilbageUI(rowIndex, produktionTimerTilbageValue);
        newRowData[17] = produktionTimerTilbageValue;
      } catch (error) {
        console.error(`Failed to recalculate produktion for ${appointmentNumber}:`, error);
      }
    }
    
    // Recalculate montage if needed
    if (recalcNeeded.montage) {
      console.log(`Need to recalculate Montage for ${appointmentNumber}`);
      try {
        const { montageValue } = await recalculateMontage(appointmentNumber, newRowData);
        updateMontageUI(rowIndex, montageValue);
        newRowData[11] = montageValue;
      } catch (error) {
        console.error(`Failed to recalculate montage for ${appointmentNumber}:`, error);
      }
    }
    
    // Handle timer tilbage recalculation directly if needed
    if (recalcNeeded.timerTilbage) {
      console.log(`Need to recalculate Timer Tilbage for ${appointmentNumber}`);
      try {
        const { timerTilbageValue } = await recalculateTimerTilbage(appointmentNumber, newRowData);
        updateTimerTilbageUI(rowIndex, timerTilbageValue);
        newRowData[16] = timerTilbageValue;
      } catch (error) {
        console.error(`Failed to recalculate timer tilbage for ${appointmentNumber}:`, error);
      }
    }
    
    // Handle produktion timer tilbage recalculation if needed
    if (recalcNeeded.produktionTimerTilbage) {
      console.log(`Need to recalculate Produktion Timer Tilbage for ${appointmentNumber}`);
      try {
        const { produktionTimerTilbageValue } = await recalculateProduktionTimerTilbage(appointmentNumber, newRowData);
        updateProduktionTimerTilbageUI(rowIndex, produktionTimerTilbageValue);
        newRowData[17] = produktionTimerTilbageValue;
      } catch (error) {
        console.error(`Failed to recalculate produktion timer tilbage for ${appointmentNumber}:`, error);
      }
    }
    
    // Always recalculate the total when any of the values change that affect it
    if (recalcNeeded.total || recalcNeeded.projektering || recalcNeeded.produktion || recalcNeeded.montage) {
      try {
        // Use the newest row data for calculation
        const totalValue = calculateTotal(newRowData);
        const totalNumeric = parseNumber(totalValue);
        
        console.log(`Calculated new total value: ${totalValue} (${totalNumeric}) for appointment ${appointmentNumber}`);
        
        // Update the total in the database
        await updateAppointmentField(
          appointmentNumber,
          'total',
          totalNumeric
        );
        
        // Update the UI with the new total value
        setTableData(prevData => {
          const newData = [...prevData];
          const rowCopy = [...newData[rowIndex]];
          // Update the total column (index 15)
          rowCopy[15] = totalValue;
          newData[rowIndex] = rowCopy;
          return newData;
        });
      } catch (error) {
        console.error(`Failed to recalculate total for ${appointmentNumber}:`, error);
      }
    }
  };
  
  return { handleRecalculations };
};
