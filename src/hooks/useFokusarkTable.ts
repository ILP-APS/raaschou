
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  saveApiDataToSupabase, 
  loadFokusarkAppointments, 
  updateAppointmentField, 
  transformAppointmentsToDisplayData 
} from "@/services/fokusarkAppointmentService";
import { parseNumber } from "@/utils/fokusarkCalculations";
import { FokusarkAppointment } from "@/api/fokusarkAppointmentsApi";

export interface FokusarkTableData {
  data: string[][];
  isLoading: boolean;
}

export const useFokusarkTable = (initialData: string[][]) => {
  const [tableData, setTableData] = useState<string[][]>([]);
  const [appointments, setAppointments] = useState<FokusarkAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  
  // Load data and process it via Supabase when component mounts
  useEffect(() => {
    async function initializeData() {
      if (!initialData.length || isInitialized) return;
      
      try {
        setIsLoading(true);
        console.log('Initializing Fokusark data...');
        
        // First, try to load existing data from Supabase
        let appointmentsData: FokusarkAppointment[] = [];
        
        try {
          appointmentsData = await loadFokusarkAppointments();
          console.log(`Loaded ${appointmentsData.length} existing appointments`);
        } catch (error) {
          console.error('Error loading existing appointment data:', error);
          // Continue with empty array if load fails
        }
        
        // If no data in Supabase yet, save the initial API data
        if (appointmentsData.length === 0) {
          toast({
            title: "Initializing database",
            description: "Saving appointment data to database for the first time",
          });
          
          try {
            console.log('No existing data found. Saving initial data...');
            appointmentsData = await saveApiDataToSupabase(initialData);
            console.log(`Successfully saved ${appointmentsData.length} appointments`);
            
            toast({
              title: "Database initialized",
              description: `Successfully saved ${appointmentsData.length} appointments`,
            });
          } catch (error) {
            console.error('Error saving initial data to Supabase:', error);
            toast({
              title: "Error initializing database",
              description: "Could not save initial data to database. See console for details.",
              variant: "destructive",
            });
            
            // Fall back to using initialData directly
            setTableData(initialData);
            setIsLoading(false);
            setIsInitialized(true);
            return;
          }
        }
        
        // Store appointments data
        setAppointments(appointmentsData);
        
        // Transform appointments to display format
        const displayData = transformAppointmentsToDisplayData(appointmentsData);
        setTableData(displayData);
        
        // Mark as initialized
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing fokusark data:', error);
        toast({
          title: "Error loading data",
          description: "Could not load or process the data. Using fallback values.",
          variant: "destructive",
        });
        
        // Fall back to using initialData directly
        setTableData(initialData);
      } finally {
        setIsLoading(false);
      }
    }
    
    initializeData();
  }, [initialData, isInitialized, toast]);
  
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
  
  // Helper function for Danish number formatting
  const formatDanishNumber = (value: number): string => {
    return value.toLocaleString('da-DK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  
  return { tableData, isLoading, handleCellChange };
};
