
import { FokusarkAppointment } from "@/api/fokusarkAppointmentsApi";
import { formatDanishNumber } from "@/utils/formatUtils";
import { formatValueOrEmpty } from "./helpers";

/**
 * Add realized values (columns 12-15)
 */
export const addRealizedValues = (appointment: FokusarkAppointment, row: string[]): void => {
  // Debug log the realized values
  console.log(`Adding realized values for ${appointment.appointment_number}:`, {
    projektering_2: appointment.projektering_2,
    produktion_realized: appointment.produktion_realized, // From API
    montage_3: appointment.montage_3
  });

  row[12] = formatValueOrEmpty(appointment.projektering_2);
  
  // For column 13 (realized produktion - explicitly from API)
  row[13] = formatValueOrEmpty(appointment.produktion_realized);
  
  // Special debug for appointment 24258
  if (appointment.appointment_number === '24258') {
    console.log(`[CRITICAL DEBUG] Adding realized produktion for 24258:`, {
      produktion_realized_value: appointment.produktion_realized,
      formatted: formatValueOrEmpty(appointment.produktion_realized)
    });
  }
  
  row[14] = formatValueOrEmpty(appointment.montage_3);
  
  // Calculate and add total
  const total = (appointment.projektering_2 || 0) + 
                (appointment.produktion_realized || 0) + 
                (appointment.montage_3 || 0);
  row[15] = formatDanishNumber(total);
};

