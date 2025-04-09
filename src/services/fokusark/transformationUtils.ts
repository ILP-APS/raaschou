
import { FokusarkAppointment } from "@/api/fokusarkAppointmentsApi";
import { parseNumber } from "@/utils/numberFormatUtils";
import { formatDanishNumber } from "@/utils/formatUtils";
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
      // Initialize with null values
      montage2: null,
      underleverandor2: null,
      materialer: null,
      projektering_1: null,
      produktion: null,
      montage_3: null,
      total: null,
      projektering_2: null,
      produktion_realized: null, // Explicitly initialize this to null
      timer_tilbage_1: null,
      faerdig_pct_ex_montage_nu: null,
      faerdig_pct_ex_montage_foer: null,
      est_timer_ift_faerdig_pct: null,
      plus_minus_timer: null,
      timer_tilbage_2: null,
      afsat_fragt: null
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
    
    // Parse the rest of the editable columns if they contain actual values
    if (row.length > 8) {
      // Materialer is at index 8 (handled by database trigger)
      
      // Est 2 (Projektering_1) at index 9
      if (row[9] && /\d/.test(row[9]) && !/R\d+C\d+/.test(row[9])) {
        appointment.projektering_1 = parseNumber(row[9]);
      }
      
      // Est 3 (Produktion) at index 10
      if (row[10] && /\d/.test(row[10]) && !/R\d+C\d+/.test(row[10])) {
        appointment.produktion = parseNumber(row[10]);
      }
      
      // Est 4 (Montage_3) at index 11
      if (row[11] && /\d/.test(row[11]) && !/R\d+C\d+/.test(row[11])) {
        appointment.montage_3 = parseNumber(row[11]);
      }
      
      // Skip Real columns (12-15) as they're not editable in our current implementation
      
      // Timer tilbage (timer_tilbage_1) at index 16
      if (row[16] && /\d/.test(row[16]) && !/R\d+C\d+/.test(row[16])) {
        appointment.timer_tilbage_1 = parseNumber(row[16]);
      }
      
      // Skip Prod columns (17-21) as they're not editable in our current implementation
      
      // Remaining fields would be handled similarly if needed
    }
    
    return appointment;
  });
};

/**
 * Format a numeric value for display, returning empty string if null
 */
const formatValueOrEmpty = (value: number | null): string => {
  return value !== null ? formatDanishNumber(value) : '';
};

/**
 * Add core appointment data (first 8 columns)
 */
const addCoreAppointmentData = (appointment: FokusarkAppointment): string[] => {
  const row: string[] = [];
  
  // Basic columns
  row[0] = appointment.appointment_number;
  row[1] = appointment.subject || 'N/A';
  row[2] = appointment.responsible_person || 'Unknown';
  row[3] = formatDanishNumber(appointment.tilbud || 0);
  row[4] = formatDanishNumber(appointment.montage || 0);
  row[5] = formatDanishNumber(appointment.underleverandor || 0);
  row[6] = formatValueOrEmpty(appointment.montage2);
  row[7] = formatValueOrEmpty(appointment.underleverandor2);
  
  return row;
};

/**
 * Add estimated values (columns 8-11)
 */
const addEstimatedValues = (appointment: FokusarkAppointment, row: string[]): void => {
  row[8] = formatDanishNumber(appointment.materialer || 0);
  row[9] = formatValueOrEmpty(appointment.projektering_1);
  row[10] = formatValueOrEmpty(appointment.produktion);
  row[11] = formatValueOrEmpty(appointment.montage_3);
};

/**
 * Add realized values (columns 12-15)
 */
const addRealizedValues = (appointment: FokusarkAppointment, row: string[]): void => {
  row[12] = formatValueOrEmpty(appointment.projektering_2);
  
  // Explicitly use produktion_realized for the realized production column (column 13)
  row[13] = formatValueOrEmpty(appointment.produktion_realized);
  
  row[14] = formatValueOrEmpty(appointment.montage_3);
  
  // Calculate and add total
  const total = (appointment.projektering_2 || 0) + 
                (appointment.produktion_realized || 0) + 
                (appointment.montage_3 || 0);
  row[15] = formatDanishNumber(total);
};

/**
 * Add remaining columns (timer tilbage and production data)
 */
const addRemainingColumns = (appointment: FokusarkAppointment, row: string[]): void => {
  // Calculate timer_tilbage as projektering_1 - projektering_2
  const timerTilbage = (appointment.projektering_1 || 0) - (appointment.projektering_2 || 0);
  row[16] = formatDanishNumber(timerTilbage);
  
  // Add production columns in the new rearranged order
  row[17] = formatValueOrEmpty(appointment.timer_tilbage_2); // Timer tilbage (moved from position 21)
  row[18] = formatValueOrEmpty(appointment.faerdig_pct_ex_montage_nu); // Moved from position 17
  row[19] = formatValueOrEmpty(appointment.faerdig_pct_ex_montage_foer); // Moved from position 18
  row[20] = formatValueOrEmpty(appointment.est_timer_ift_faerdig_pct); // Moved from position 19
  row[21] = formatValueOrEmpty(appointment.plus_minus_timer); // Moved from position 20
  
  // Add afsat fragt (transport) column
  row[22] = formatValueOrEmpty(appointment.afsat_fragt);
};

/**
 * Transform FokusarkAppointment data from Supabase back to display format
 */
export const transformAppointmentsToDisplayData = (appointments: FokusarkAppointment[]): string[][] => {
  return appointments.map(appointment => {
    // Start with core appointment data
    const row = addCoreAppointmentData(appointment);
    
    // Add estimated values
    addEstimatedValues(appointment, row);
    
    // Add realized values
    addRealizedValues(appointment, row);
    
    // Add remaining columns
    addRemainingColumns(appointment, row);
    
    // Add visual indication for sub-appointments
    row.push(appointment.is_sub_appointment ? 'sub-appointment' : 'parent-appointment');
    
    return row;
  });
};
