
import { 
  fetchFokusarkAppointments as mockFetchAppointments, 
  batchUpsertFokusarkAppointments as mockBatchUpsert,
  updateFokusarkAppointmentField as mockUpdateField,
  FokusarkAppointment
} from "../utils/appointmentUtils";

let cachedAppointments: FokusarkAppointment[] | null = null;

export const loadFokusarkAppointments = async (): Promise<FokusarkAppointment[]> => {
  try {
    if (cachedAppointments) {
      return cachedAppointments;
    }
    const appointments = await mockFetchAppointments();
    cachedAppointments = appointments;
    return appointments;
  } catch (error) {
    console.error('Error loading fokusark appointments:', error);
    throw error;
  }
};

export const saveAppointmentBatch = async (appointments: FokusarkAppointment[]): Promise<void> => {
  try {
    await mockBatchUpsert(appointments);
    cachedAppointments = appointments;
  } catch (error) {
    console.error('Error batch saving appointment data:', error);
    throw error;
  }
};

export const updateAppointmentField = async (
  appointmentNumber: string,
  field: string,
  value: any
): Promise<FokusarkAppointment> => {
  try {
    const result = await mockUpdateField(appointmentNumber, field, value);
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
