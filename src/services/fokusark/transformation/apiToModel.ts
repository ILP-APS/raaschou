
import { FokusarkAppointment } from "@/api/fokusarkAppointmentsApi";
import { parseNumber } from "@/utils/numberFormatUtils";
import { isValidNumericValue } from "./helpers";
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
    if (montage2Str && isValidNumericValue(montage2Str)) {
      appointment.montage2 = parseNumber(montage2Str);
    }
    
    if (underlev2Str && isValidNumericValue(underlev2Str)) {
      appointment.underleverandor2 = parseNumber(underlev2Str);
    }
    
    // Parse the rest of the editable columns if they contain actual values
    if (row.length > 8) {
      // Materialer is at index 8 (handled by database trigger)
      
      // Est 2 (Projektering_1) at index 9
      if (row[9] && isValidNumericValue(row[9])) {
        appointment.projektering_1 = parseNumber(row[9]);
      }
      
      // Est 3 (Produktion) at index 10
      if (row[10] && isValidNumericValue(row[10])) {
        appointment.produktion = parseNumber(row[10]);
      }
      
      // Est 4 (Montage_3) at index 11
      if (row[11] && isValidNumericValue(row[11])) {
        appointment.montage_3 = parseNumber(row[11]);
      }
      
      // Skip Real columns (12-15) as they're not editable in our current implementation
      
      // Timer tilbage (timer_tilbage_1) at index 16
      if (row[16] && isValidNumericValue(row[16])) {
        appointment.timer_tilbage_1 = parseNumber(row[16]);
      }
      
      // Skip Prod columns (17-21) as they're not editable in our current implementation
      
      // Remaining fields would be handled similarly if needed
    }
    
    return appointment;
  });
};

