
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
      
      // Recalculate Projektering if Tilbud or Montage values changed
      if (colIndex === 3 || colIndex === 4 || colIndex === 6) {
        // Get the current row data with the updated value
        const updatedRow = [...tableData[rowIndex]];
        updatedRow[colIndex] = value; // Make sure we're using the latest value
        
        // Recalculate and update projektering
        const { projekteringValue } = await recalculateProjektering(appointmentNumber, updatedRow);
        
        // Update UI with new projektering value
        updateProjekteringUI(rowIndex, projekteringValue);
        
        // After updating projektering, also update produktion which depends on it
        // Get the updated row with the new projektering value
        const updatedRowWithProjektering = [...tableData[rowIndex]];
        updatedRowWithProjektering[colIndex] = value;
        updatedRowWithProjektering[9] = projekteringValue;
        
        // Recalculate and update produktion
        const { produktionValue } = await recalculateProduktion(appointmentNumber, updatedRowWithProjektering);
        
        // Update UI with new produktion value
        updateProduktionUI(rowIndex, produktionValue);
      }
      
      // Similarly, calculate Produktion if Materialer or Projektering changed
      if (colIndex === 8 || colIndex === 9) {
        // Get the current row data with the updated value
        const updatedRow = [...tableData[rowIndex]];
        updatedRow[colIndex] = value; // Make sure we're using the latest value
        
        // Recalculate and update produktion
        const { produktionValue } = await recalculateProduktion(appointmentNumber, updatedRow);
        
        // Update UI with new produktion value
        updateProduktionUI(rowIndex, produktionValue);
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
