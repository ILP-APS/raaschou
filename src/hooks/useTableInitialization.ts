
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  saveApiDataToSupabase, 
  loadFokusarkAppointments,
  transformAppointmentsToDisplayData 
} from "@/services/fokusarkAppointmentService";
import { recalculateAllFields } from "@/utils/fokusarkCalculations";
import { FokusarkAppointment } from "@/api/fokusarkAppointmentsApi";

/**
 * Hook to handle table data initialization
 */
export const useTableInitialization = (initialData: string[][]) => {
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
            
            // Apply calculations to initial data before saving
            const calculatedData = recalculateAllFields(initialData);
            
            appointmentsData = await saveApiDataToSupabase(calculatedData);
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
        } else {
          // Ensure all appointments have projektering calculated correctly
          try {
            console.log('Verifying all appointments have projektering calculated...');
            
            // Get display data format
            let displayData = transformAppointmentsToDisplayData(appointmentsData);
            
            // Check if any projektering fields need recalculation
            let needsRecalculation = false;
            for (const row of displayData) {
              const projekteringValue = parseFloat(row[9].replace(/\./g, '').replace(',', '.')) || 0;
              if (projekteringValue === 0) {
                needsRecalculation = true;
                break;
              }
            }
            
            if (needsRecalculation) {
              console.log('Some projektering values need recalculation, updating...');
              displayData = recalculateAllFields(displayData);
              appointmentsData = await loadFokusarkAppointments();
            }
          } catch (error) {
            console.error('Error recalculating projektering values:', error);
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
  
  return { tableData, appointments, setAppointments, setTableData, isLoading, isInitialized };
};
