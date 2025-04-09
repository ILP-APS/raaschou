
import { FokusarkAppointment } from "@/api/fokusarkAppointmentsApi";
import { recalculateAllFields } from "@/utils/fokusarkCalculations";
import { transformApiDataToAppointments } from "./transformationUtils";
import { loadFokusarkAppointments, saveAppointmentBatch } from "./appointmentDbService";

/**
 * Save raw API data to Supabase
 */
export const saveApiDataToSupabase = async (tableData: string[][]): Promise<FokusarkAppointment[]> => {
  try {
    console.log('Saving appointment data to Supabase...');
    console.log('Table data rows:', tableData.length);
    
    // Transform the API data to appointments
    const appointments = transformApiDataToAppointments(tableData);
    console.log('Transformed appointments:', appointments.length);
    
    // Save all appointments in a batch operation
    await saveAppointmentBatch(appointments);
    
    // Return the saved appointments
    return await loadFokusarkAppointments();
  } catch (error) {
    console.error('Error saving appointment data to Supabase:', error);
    throw error;
  }
};
