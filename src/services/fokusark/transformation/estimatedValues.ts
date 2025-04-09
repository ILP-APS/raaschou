
import { FokusarkAppointment } from "@/api/fokusarkAppointmentsApi";
import { formatDanishNumber } from "@/utils/formatUtils";
import { formatValueOrEmpty } from "./helpers";

/**
 * Add estimated values (columns 8-11)
 */
export const addEstimatedValues = (appointment: FokusarkAppointment, row: string[]): void => {
  // Debug log the appointment data for verification
  console.log(`Adding estimated values for ${appointment.appointment_number}:`, {
    materialer: appointment.materialer,
    projektering_1: appointment.projektering_1,
    produktion: appointment.produktion,
    montage_3: appointment.montage_3,
    produktion_realized: appointment.produktion_realized
  });

  row[8] = formatDanishNumber(appointment.materialer || 0);
  row[9] = formatValueOrEmpty(appointment.projektering_1);
  
  // For column 10 (produktion - estimated calculated value)
  row[10] = formatValueOrEmpty(appointment.produktion);
  
  // Special debug for appointment 24258
  if (appointment.appointment_number === '24258') {
    console.log(`[CRITICAL DEBUG] Adding estimated produktion for 24258:`, {
      produktion_value: appointment.produktion,
      formatted: formatValueOrEmpty(appointment.produktion)
    });
  }
  
  row[11] = formatValueOrEmpty(appointment.montage_3);
};

