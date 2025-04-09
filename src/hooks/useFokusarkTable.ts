
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
        
        // First, try to load existing data from Supabase
        let appointmentsData: FokusarkAppointment[] = [];
        
        try {
          appointmentsData = await loadFokusarkAppointments();
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
            appointmentsData = await saveApiDataToSupabase(initialData);
            toast({
              title: "Database initialized",
              description: `Successfully saved ${appointmentsData.length} appointments`,
            });
          } catch (error) {
            console.error('Error saving initial data to Supabase:', error);
            toast({
              title: "Error initializing database",
              description: "Could not save initial data to database",
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
    let fieldName = '';
    let parsedValue: number | null = null;
    
    if (colIndex === 6) {
      fieldName = 'montage2';
      parsedValue = parseNumber(value);
    } else if (colIndex === 7) {
      fieldName = 'underleverandor2';
      parsedValue = parseNumber(value);
    }
    
    if (!fieldName) {
      console.error(`Unsupported column index for update: ${colIndex}`);
      return;
    }
    
    // Save to Supabase
    try {
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
      
      // Update the materialer value in the table display
      const materialerValue = updatedAppointment.materialer || 0;
      
      setTableData(prevData => {
        const newData = [...prevData];
        const rowCopy = [...newData[rowIndex]];
        // Update the materialer column (index 8)
        rowCopy[8] = materialerValue.toLocaleString('da-DK', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        newData[rowIndex] = rowCopy;
        return newData;
      });
      
      // Show a toast notification
      toast({
        title: "Updated successfully",
        description: `Updated ${fieldName === 'montage2' ? 'Montage 2' : 'Underleverandør 2'} for ${appointmentNumber}`,
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
  
  return { tableData, isLoading, handleCellChange };
};
