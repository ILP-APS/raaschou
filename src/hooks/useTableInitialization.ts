
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
      // Always try to load data, even if initialData is empty
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
        
        // If no data in Supabase yet and we have initialData, save it
        if (appointmentsData.length === 0 && initialData && initialData.length > 0) {
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
        } else if (appointmentsData.length === 0 && (!initialData || initialData.length === 0)) {
          // No data in database and no initial data provided
          console.log('No existing data found and no initial data provided');
          toast({
            title: "No data available",
            description: "No data in database and no initial data provided. Try refreshing the data.",
          });
          
          setTableData([]);
          setIsLoading(false);
          setIsInitialized(true);
          return;
        } else if (appointmentsData.length > 0) {
          // We have data from the database, use it
          console.log(`Using ${appointmentsData.length} appointments from database`);
          
          // Ensure all appointments have projektering calculated correctly
          try {
            // Get display data format
            let displayData = transformAppointmentsToDisplayData(appointmentsData);
            
            // Check if any projektering fields need recalculation
            let needsRecalculation = false;
            for (const row of displayData) {
              const projekteringValue = parseFloat(row[9]?.replace(/\./g, '')?.replace(',', '.')) || 0;
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
        console.log('Transformed display data:', displayData.length, 'rows');
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
        
        // Fall back to using initialData directly if available
        if (initialData && initialData.length > 0) {
          setTableData(initialData);
        } else {
          setTableData([]);
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    initializeData();
  }, [initialData, toast]);
  
  return { tableData, appointments, setAppointments, setTableData, isLoading, isInitialized };
};
