
import { 
  fetchFokusarkAppointments, 
  upsertFokusarkAppointment, 
  batchUpsertFokusarkAppointments,
  updateFokusarkAppointmentField,
  FokusarkAppointment
} from "@/api/fokusarkAppointmentsApi";
import { parseNumber } from "@/utils/fokusarkCalculations";
import { isSubAppointment } from "@/utils/appointmentUtils";

/**
 * Transform raw table data from API to FokusarkAppointment format
 */
export const transformApiDataToAppointments = (tableData: string[][]): FokusarkAppointment[] => {
  return tableData.map(row => {
    // Extract the row type indicator from the last element
    const rowType = row[row.length - 1];
    const isSubApp = rowType === 'sub-appointment';
    
    // Create appointment object
    const appointment: FokusarkAppointment = {
      appointment_number: row[0],
      subject: row[1],
      responsible_person: row[2],
      tilbud: parseNumber(row[3]),
      montage: parseNumber(row[4]),
      underleverandor: parseNumber(row[5]),
      is_sub_appointment: isSubApp,
      // Initialize with empty values
      montage2: null,
      underleverandor2: null,
      materialer: null
    };
    
    // Add Montage 2 and Underleverandor 2 if they contain actual values
    const montage2Str = row[6];
    const underlev2Str = row[7];
    
    // Only include if they are not placeholder values
    if (montage2Str && /\d/.test(montage2Str) && !/R\d+C\d+/.test(montage2Str)) {
      appointment.montage2 = parseNumber(montage2Str);
    }
    
    if (underlev2Str && /\d/.test(underlev2Str) && !/R\d+C\d+/.test(underlev2Str)) {
      appointment.underleverandor2 = parseNumber(underlev2Str);
    }
    
    return appointment;
  });
};

/**
 * Transform FokusarkAppointment data from Supabase back to display format
 */
export const transformAppointmentsToDisplayData = (appointments: FokusarkAppointment[]): string[][] => {
  return appointments.map(appointment => {
    const row: string[] = [];
    
    // Add the basic columns
    row[0] = appointment.appointment_number;
    row[1] = appointment.subject || 'N/A';
    row[2] = appointment.responsible_person || 'Unknown';
    row[3] = formatNumberToDanish(appointment.tilbud || 0);
    row[4] = formatNumberToDanish(appointment.montage || 0);
    row[5] = formatNumberToDanish(appointment.underleverandor || 0);
    row[6] = appointment.montage2 !== null ? formatNumberToDanish(appointment.montage2) : '';
    row[7] = appointment.underleverandor2 !== null ? formatNumberToDanish(appointment.underleverandor2) : '';
    row[8] = formatNumberToDanish(appointment.materialer || 0);
    
    // Add placeholder data for remaining columns
    for (let i = 9; i < 24; i++) {
      row[i] = '';
    }
    
    // Add visual indication for sub-appointments
    row.push(appointment.is_sub_appointment ? 'sub-appointment' : 'parent-appointment');
    
    return row;
  });
};

/**
 * Format a number to Danish locale format (comma as decimal separator, period as thousands separator)
 */
export const formatNumberToDanish = (value: number): string => {
  // Check for NaN
  if (isNaN(value)) return '0,00';

  return value.toLocaleString('da-DK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

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
    const result = await batchUpsertFokusarkAppointments(appointments);
    console.log('Batch upsert result:', result);
    
    // Return the saved appointments
    return await loadFokusarkAppointments();
  } catch (error) {
    console.error('Error saving appointment data to Supabase:', error);
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
