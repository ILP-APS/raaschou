
import { 
  fetchFokusarkAppointments, 
  batchUpsertFokusarkAppointments,
  updateFokusarkAppointmentField,
  FokusarkAppointment
} from "@/api/fokusarkAppointmentsApi";

/**
 * Load all appointments from Supabase
 */
export const loadFokusarkAppointments = async (): Promise<FokusarkAppointment[]> => {
  try {
    console.log('Loading fokusark appointments from Supabase...');
    const appointments = await fetchFokusarkAppointments();
    console.log(`Loaded ${appointments.length} appointments from Supabase`);
    return appointments;
  } catch (error) {
    console.error('Error loading fokusark appointments:', error);
    throw error;
  }
};

/**
 * Save batch of appointment data to Supabase
 */
export const saveAppointmentBatch = async (appointments: FokusarkAppointment[]): Promise<void> => {
  try {
    console.log('Batch saving appointments to Supabase...');
    console.log('Appointments to save:', appointments.length);
    
    // Save all appointments in a batch operation
    const result = await batchUpsertFokusarkAppointments(appointments);
    console.log('Batch upsert completed');
  } catch (error) {
    console.error('Error batch saving appointment data to Supabase:', error);
    throw error;
  }
};

/**
 * Update a specific field for an appointment
 */
export const updateAppointmentField = async (
  appointmentNumber: string,
  field: string,
  value: any
): Promise<FokusarkAppointment> => {
  try {
    console.log(`Updating ${field} for appointment ${appointmentNumber} to ${value}`);
    
    // If this is appointment 24371 and we're updating projektering_1, log extra debug info
    if (appointmentNumber === '24371' && field === 'projektering_1') {
      console.log(`Special debug: Updating projektering for 24371 to ${value}`);
    }
    
    const result = await updateFokusarkAppointmentField(appointmentNumber, field, value);
    
    // Add debug log for the updated appointment
    if (appointmentNumber === '24371') {
      console.log('Updated appointment 24371:', result);
    }
    
    return result;
  } catch (error) {
    console.error(`Error updating ${field} for appointment ${appointmentNumber}:`, error);
    throw error;
  }
};
