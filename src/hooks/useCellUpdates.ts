
import { useToast } from "@/hooks/use-toast";
import { updateAppointmentField, loadFokusarkAppointments, transformAppointmentsToDisplayData } from "@/services/fokusarkAppointmentService";
import { parseNumber, formatDanishNumber, calculateProjektering } from "@/utils/fokusarkCalculations";
import { FokusarkAppointment } from "@/api/fokusarkAppointmentsApi";

/**
 * Hook to handle table cell updates
 */
export const useCellUpdates = (
  tableData: string[][],
  setTableData: React.Dispatch<React.SetStateAction<string[][]>>,
  appointments: FokusarkAppointment[],
  setAppointments: React.Dispatch<React.SetStateAction<FokusarkAppointment[]>>
) => {
  const { toast } = useToast();
  
  // Function to determine which field to update based on column index
  const getFieldNameForColumn = (colIndex: number): string | null => {
    switch (colIndex) {
      case 6:
        return 'montage2';
      case 7:
        return 'underleverandor2';
      case 9:
        return 'projektering_1';
      case 10:
        return 'produktion';
      case 11:
        return 'montage_3';
      case 14:
        return 'timer_tilbage_1';
      case 15:
        return 'faerdig_pct_ex_montage_nu';
      case 16:
        return 'faerdig_pct_ex_montage_foer';
      case 17:
        return 'est_timer_ift_faerdig_pct';
      case 18:
        return 'plus_minus_timer';
      case 19:
        return 'timer_tilbage_2';
      case 20:
        return 'afsat_fragt';
      default:
        return null;
    }
  };
  
  // Handle cell value changes
  const handleCellChange = async (rowIndex: number, colIndex: number, value: string) => {
    // Get the appointment number from the current row
    const appointmentNumber = tableData[rowIndex][0];
    
    // Update local state first for immediate feedback
    setTableData(prevData => {
      const newData = [...prevData];
      const rowCopy = [...newData[rowIndex]];
      rowCopy[colIndex] = value;
      newData[rowIndex] = rowCopy;
      return newData;
    });
    
    // Determine which field to update based on column index
    const fieldName = getFieldNameForColumn(colIndex);
    if (!fieldName) {
      console.error(`Unsupported column index for update: ${colIndex}`);
      return;
    }
    
    // Parse the value
    const parsedValue = parseNumber(value);
    
    // Save to Supabase
    try {
      console.log(`Updating ${fieldName} for appointment ${appointmentNumber} to ${parsedValue}`);
      
      // Update the field in Supabase
      const updatedAppointment = await updateAppointmentField(
        appointmentNumber, 
        fieldName, 
        parsedValue
      );
      
      // Update the appointments state with the new data
      setAppointments(prev => 
        prev.map(app => 
          app.appointment_number === appointmentNumber ? updatedAppointment : app
        )
      );
      
      // If materialer was updated by the trigger, update it in the UI
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
      
      // If total was updated by the trigger, update it in the UI
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
      
      // Calculate Projektering and update UI if Tilbud or Montage values changed
      if (colIndex === 3 || colIndex === 4 || colIndex === 6) {
        console.log("Tilbud or Montage value changed, recalculating Projektering");
        
        // Get the current row data with the updated value
        const updatedRow = [...tableData[rowIndex]];
        updatedRow[colIndex] = value; // Make sure we're using the latest value
        
        // Use the common calculation function for consistency
        const projekteringValue = calculateProjektering(updatedRow);
        
        console.log(`Calculated new projektering value: ${projekteringValue} for appointment ${appointmentNumber}`);
        
        // Update the UI with the new calculated value
        setTableData(prevData => {
          const newData = [...prevData];
          const rowCopy = [...newData[rowIndex]];
          // Update the projektering column (index 9)
          rowCopy[9] = projekteringValue;
          newData[rowIndex] = rowCopy;
          return newData;
        });
        
        // Also update Supabase with the calculated value
        const projekteringNumericValue = parseNumber(projekteringValue);
        await updateAppointmentField(
          appointmentNumber, 
          'projektering_1', 
          projekteringNumericValue
        );
        
        console.log(`Updated projektering_1 in database to ${projekteringNumericValue}`);
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
  
  // Helper function to get column display name for toast messages
  const getColumnDisplayName = (colIndex: number): string => {
    switch (colIndex) {
      case 6:
        return 'Montage 2';
      case 7:
        return 'Underleverandør 2';
      case 9:
        return 'Projektering';
      case 10:
        return 'Produktion';
      case 11:
        return 'Montage';
      case 14:
        return 'Timer tilbage';
      case 15:
        return 'Færdig % ex montage nu';
      case 16:
        return 'Færdig % ex montage før';
      case 17:
        return 'Est timer ift færdig %';
      case 18:
        return '+/- timer';
      case 19:
        return 'Timer tilbage';
      case 20:
        return 'Afsat fragt';
      default:
        return `Column ${colIndex + 1}`;
    }
  };
  
  return { handleCellChange };
};
