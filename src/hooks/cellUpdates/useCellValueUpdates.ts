
import { useToast } from "@/hooks/use-toast";
import { updateAppointmentField, loadFokusarkAppointments, transformAppointmentsToDisplayData } from "@/services/fokusarkAppointmentService";
import { formatPercentageInput } from "@/utils/fokusarkCalculations";
import { FokusarkAppointment } from "@/api/fokusarkAppointmentsApi";
import { Dispatch, SetStateAction } from 'react';
import { useFieldMapping } from "./useFieldMapping";

interface UseCellValueUpdatesProps {
  setAppointments: Dispatch<SetStateAction<FokusarkAppointment[]>>;
  setTableData: Dispatch<SetStateAction<string[][]>>;
}

/**
 * Hook to handle direct cell value updates
 */
export const useCellValueUpdates = ({
  setAppointments,
  setTableData
}: UseCellValueUpdatesProps) => {
  const { toast } = useToast();
  const { getFieldNameForColumn, getColumnDisplayName } = useFieldMapping();
  
  // Helper function to determine if a column should be treated as percentage
  const isPercentageColumn = (colIndex: number): boolean => {
    return [18, 19].includes(colIndex); 
  };
  
  // Helper function to determine if a column should be treated as currency
  const isCurrencyColumn = (colIndex: number): boolean => {
    return [3, 4, 5, 6, 7, 8, 9, 10, 11].includes(colIndex);
  };
  
  // Updates cell value in the database
  const updateCellValueInDb = async (
    appointmentNumber: string,
    colIndex: number,
    value: string
  ) => {
    const fieldName = getFieldNameForColumn(colIndex);
    if (!fieldName) {
      console.error(`Unsupported column index for update: ${colIndex}`);
      throw new Error(`Unsupported column index: ${colIndex}`);
    }
    
    // For percentage columns, ensure the value is formatted and capped at 100%
    if (isPercentageColumn(colIndex)) {
      value = formatPercentageInput(value);
    }
    
    try {
      // Parse numeric value for database update
      const parsedValue = parseFloat(value.replace(/\./g, '').replace(',', '.'));
      
      console.log(`Updating ${fieldName} for appointment ${appointmentNumber} to ${parsedValue}`);
      
      const updatedAppointment = await updateAppointmentField(
        appointmentNumber, 
        fieldName, 
        parsedValue
      );
      
      // Update appointments state with updated appointment
      setAppointments(prev => 
        prev.map(app => 
          app.appointment_number === appointmentNumber ? updatedAppointment : app
        )
      );
      
      toast({
        title: "Updated successfully",
        description: `Updated ${getColumnDisplayName(colIndex)} for ${appointmentNumber}`,
      });
      
      return updatedAppointment;
    } catch (error) {
      console.error(`Error updating ${fieldName} for appointment ${appointmentNumber}:`, error);
      toast({
        title: "Error saving data",
        description: "Could not save your changes to the database. Please try again.",
        variant: "destructive",
      });
      
      try {
        const reloadedAppointments = await loadFokusarkAppointments();
        setAppointments(reloadedAppointments);
        setTableData(transformAppointmentsToDisplayData(reloadedAppointments));
      } catch (reloadError) {
        console.error('Error reloading data after failed update:', reloadError);
      }
      
      throw error;
    }
  };
  
  return { 
    updateCellValueInDb, 
    isPercentageColumn,
    isCurrencyColumn
  };
};
