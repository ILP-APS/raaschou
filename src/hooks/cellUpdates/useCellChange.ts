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
  const { updateMaterialerUI, updateTotalUI, updateProjekteringUI, updateProduktionUI, updateMontageUI, updateCellUI } = useUIUpdates(tableData, setTableData);
  const { recalculateProjektering, recalculateProduktion, recalculateMontage } = useCalculations();
  
  const handleCellChange = async (rowIndex: number, colIndex: number, value: string) => {
    const appointmentNumber = tableData[rowIndex][0];
    console.log(`Updating value for appointment ${appointmentNumber}, column ${colIndex}, new value: ${value}`);
    
    updateCellUI(rowIndex, colIndex, value);
    
    const fieldName = getFieldNameForColumn(colIndex);
    if (!fieldName) {
      console.error(`Unsupported column index for update: ${colIndex}`);
      return;
    }
    
    const parsedValue = parseNumber(value);
    console.log(`Parsed value for ${appointmentNumber}, ${fieldName}: ${parsedValue}`);
    
    try {
      console.log(`Updating ${fieldName} for appointment ${appointmentNumber} to ${parsedValue}`);
      
      const updatedAppointment = await updateAppointmentField(
        appointmentNumber, 
        fieldName, 
        parsedValue
      );
      
      console.log(`Updated appointment ${appointmentNumber} in database:`, updatedAppointment);
      
      setAppointments(prev => 
        prev.map(app => 
          app.appointment_number === appointmentNumber ? updatedAppointment : app
        )
      );
      
      updateMaterialerUI(rowIndex, updatedAppointment);
      updateTotalUI(rowIndex, updatedAppointment);
      
      const shouldRecalculateProjektering = [3, 4, 6].includes(colIndex);
      const shouldRecalculateProduktion = [3, 4, 5, 6, 7, 8, 9].includes(colIndex); 
      const shouldRecalculateMontage = [4, 6].includes(colIndex);
      
      const updatedRow = [...tableData[rowIndex]];
      updatedRow[colIndex] = value;
      
      if (shouldRecalculateProjektering) {
        console.log(`Need to recalculate Projektering for ${appointmentNumber} due to column ${colIndex} change`);
        try {
          const { projekteringValue } = await recalculateProjektering(appointmentNumber, updatedRow);
          updateProjekteringUI(rowIndex, projekteringValue);
          updatedRow[9] = projekteringValue;
        } catch (error) {
          console.error(`Failed to recalculate projektering for ${appointmentNumber}:`, error);
        }
      }
      
      if (shouldRecalculateProduktion) {
        console.log(`Need to recalculate Produktion for ${appointmentNumber} due to column ${colIndex} change`);
        try {
          const { produktionValue } = await recalculateProduktion(appointmentNumber, updatedRow);
          updateProduktionUI(rowIndex, produktionValue);
        } catch (error) {
          console.error(`Failed to recalculate produktion for ${appointmentNumber}:`, error);
        }
      }
      
      if (shouldRecalculateMontage) {
        console.log(`Need to recalculate Montage for ${appointmentNumber} due to column ${colIndex} change`);
        try {
          const { montageValue } = await recalculateMontage(appointmentNumber, updatedRow);
          updateMontageUI(rowIndex, montageValue);
        } catch (error) {
          console.error(`Failed to recalculate montage for ${appointmentNumber}:`, error);
        }
      }
      
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
