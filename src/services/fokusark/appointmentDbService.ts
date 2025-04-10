
import { 
  fetchFokusarkAppointments as mockFetchAppointments, 
  batchUpsertFokusarkAppointments as mockBatchUpsert,
  updateFokusarkAppointmentField as mockUpdateField,
  FokusarkAppointment
} from "@/api/fokusarkAppointmentsApi";

// Cache for appointments to prevent continuous API mocking
let cachedAppointments: FokusarkAppointment[] | null = null;

/**
 * Load all appointments using mock data
 */
export const loadFokusarkAppointments = async (): Promise<FokusarkAppointment[]> => {
  try {
    // Return cached data if available
    if (cachedAppointments) {
      console.log('Using cached fokusark appointments');
      return cachedAppointments;
    }
    
    console.log('Loading mock fokusark appointments...');
    const appointments = await mockFetchAppointments();
    console.log(`Loaded ${appointments.length} mock appointments`);
    
    // Cache the appointments
    cachedAppointments = appointments;
    return appointments;
  } catch (error) {
    console.error('Error loading fokusark appointments:', error);
    throw error;
  }
};

/**
 * Save batch of appointment data using mock implementation
 */
export const saveAppointmentBatch = async (appointments: FokusarkAppointment[]): Promise<void> => {
  try {
    console.log('Mock: Batch saving appointments...');
    console.log('Appointments to save:', appointments.length);
    
    // Use mock batch upsert
    await mockBatchUpsert(appointments);
    console.log('Mock batch upsert completed');
    
    // Update the cache
    cachedAppointments = appointments;
  } catch (error) {
    console.error('Error batch saving appointment data:', error);
    throw error;
  }
};

/**
 * Update a specific field for an appointment using mock implementation
 */
export const updateAppointmentField = async (
  appointmentNumber: string,
  field: string,
  value: any
): Promise<FokusarkAppointment> => {
  try {
    console.log(`Mock: Updating ${field} for appointment ${appointmentNumber} to ${value}`);
    
    const result = await mockUpdateField(appointmentNumber, field, value);
    
    // Update the cached appointment if it exists
    if (cachedAppointments) {
      cachedAppointments = cachedAppointments.map(app => 
        app.appointment_number === appointmentNumber 
          ? { ...app, [field]: value } 
          : app
      );
    }
    
    return result;
  } catch (error) {
    console.error(`Error updating ${field} for appointment ${appointmentNumber}:`, error);
    throw error;
  }
};
