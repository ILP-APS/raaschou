
import { useToast } from "@/hooks/use-toast";
import { updateAppointmentField, loadFokusarkAppointments, transformAppointmentsToDisplayData } from "@/services/fokusarkAppointmentService";
import { parseNumber } from "@/utils/fokusarkCalculations";
import { FokusarkAppointment } from "@/api/fokusarkAppointmentsApi";
import { Dispatch, SetStateAction } from 'react';
import { useFieldMapping } from "./useFieldMapping";
import { useUIUpdates } from "./useUIUpdates";
import { useCalculations } from "./useCalculations";

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
  const { toast } = useToast();
  const { getFieldNameForColumn, getColumnDisplayName } = useFieldMapping();
  const { updateMaterialerUI, updateTotalUI, updateProjekteringUI, updateProduktionUI, updateCellUI } = useUIUpdates(tableData, setTableData);
  const { recalculateProjektering, recalculateProduktion } = useCalculations();
  
  // Handle cell value changes
  const handleCellChange = async (rowIndex: number, colIndex: number, value: string) => {
    // Get the appointment number from the current row
    const appointmentNumber = tableData[rowIndex][0];
    console.log(`Updating value for appointment ${appointmentNumber}, column ${colIndex}, new value: ${value}`);
    
    // Update local UI immediately for responsive feedback
    updateCellUI(rowIndex, colIndex, value);
    
    // Determine which field to update based on column index
    const fieldName = getFieldNameForColumn(colIndex);
    if (!fieldName) {
      console.error(`Unsupported column index for update: ${colIndex}`);
      return;
    }
    
    // Parse the value
    const parsedValue = parseNumber(value);
    console.log(`Parsed value for ${appointmentNumber}, ${fieldName}: ${parsedValue}`);
    
    try {
      console.log(`Updating ${fieldName} for appointment ${appointmentNumber} to ${parsedValue}`);
      
      // Update the field in Supabase
      const updatedAppointment = await updateAppointmentField(
        appointmentNumber, 
        fieldName, 
        parsedValue
      );
      
      console.log(`Updated appointment ${appointmentNumber} in database:`, updatedAppointment);
      
      // Update the appointments state with the new data
      setAppointments(prev => 
        prev.map(app => 
          app.appointment_number === appointmentNumber ? updatedAppointment : app
        )
      );
      
      // UI updates for derived fields
      updateMaterialerUI(rowIndex, updatedAppointment);
      updateTotalUI(rowIndex, updatedAppointment);
      
      // Determine which columns need recalculation
      const shouldRecalculateProjektering = [3, 4, 6].includes(colIndex); // Tilbud or Montage or Montage2 changed
      const shouldRecalculateProduktion = [8, 9].includes(colIndex) || shouldRecalculateProjektering; // Materialer or Projektering changed
      
      // Get the current row data with the updated value
      const updatedRow = [...tableData[rowIndex]];
      updatedRow[colIndex] = value; // Make sure we're using the latest value
      
      // Step 1: Recalculate projektering if needed
      if (shouldRecalculateProjektering) {
        console.log(`Need to recalculate Projektering for ${appointmentNumber} due to column ${colIndex} change`);
        try {
          // Recalculate and update projektering
          const { projekteringValue } = await recalculateProjektering(appointmentNumber, updatedRow);
          
          // Update UI with new projektering value
          updateProjekteringUI(rowIndex, projekteringValue);
          
          // Update the row with new projektering value for next calculations
          updatedRow[9] = projekteringValue;
        } catch (error) {
          console.error(`Failed to recalculate projektering for ${appointmentNumber}:`, error);
        }
      }
      
      // Step 2: Recalculate produktion if needed
      if (shouldRecalculateProduktion) {
        console.log(`Need to recalculate Produktion for ${appointmentNumber} due to column ${colIndex} change`);
        try {
          // Recalculate and update produktion
          const { produktionValue } = await recalculateProduktion(appointmentNumber, updatedRow);
          
          // Update UI with new produktion value
          updateProduktionUI(rowIndex, produktionValue);
        } catch (error) {
          console.error(`Failed to recalculate produktion for ${appointmentNumber}:`, error);
        }
      }
      
      // Show a toast notification
      toast({
        title: "Updated successfully",
        description: `Updated ${getColumnDisplayName(colIndex)} for ${appointmentNumber}`,
      });
    } catch (error) {
      console.error(`Error updating ${fieldName} for appointment ${appointmentNumber}:`, error);
      toast({
        title: "Error saving data",
        description: "Could not save your changes to the database. Please try again.",
        variant: "destructive",
      });
      
      // Reload data to ensure UI is consistent with database
      try {
        const reloadedAppointments = await loadFokusarkAppointments();
        setAppointments(reloadedAppointments);
        setTableData(transformAppointmentsToDisplayData(reloadedAppointments));
      } catch (reloadError) {
        console.error('Error reloading data after failed update:', reloadError);
      }
    }
  };
  
  return { handleCellChange };
};
