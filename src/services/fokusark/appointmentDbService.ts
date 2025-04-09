
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
    return await updateFokusarkAppointmentField(appointmentNumber, field, value);
  } catch (error) {
    console.error(`Error updating ${field} for appointment ${appointmentNumber}:`, error);
    throw error;
  }
};
