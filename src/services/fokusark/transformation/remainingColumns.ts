
import { FokusarkAppointment } from "@/api/fokusarkAppointmentsApi";
import { formatDanishNumber } from "@/utils/formatUtils";
import { formatValueOrEmpty } from "./helpers";

/**
 * Add remaining columns (timer tilbage and production data)
 */
export const addRemainingColumns = (appointment: FokusarkAppointment, row: string[]): void => {
  // Calculate timer_tilbage as projektering_1 - projektering_2
  const timerTilbage = (appointment.projektering_1 || 0) - (appointment.projektering_2 || 0);
  row[16] = formatDanishNumber(timerTilbage);
  
  // Calculate produktion timer tilbage as produktion - produktion_realized
  const produktionTimerTilbage = (appointment.produktion || 0) - (appointment.produktion_realized || 0);
  row[17] = formatDanishNumber(produktionTimerTilbage);
  
  // Special debug for appointment 24258
  if (appointment.appointment_number === '24258') {
    console.log(`[CRITICAL DEBUG] Adding produktion timer tilbage for 24258:`, {
      produktion: appointment.produktion, // estimated/calculated
      produktion_realized: appointment.produktion_realized, // from API
      difference: (appointment.produktion || 0) - (appointment.produktion_realized || 0),
      formatted_difference: formatDanishNumber((appointment.produktion || 0) - (appointment.produktion_realized || 0))
    });
  }
  
  // Add production columns in the new rearranged order
  row[18] = formatValueOrEmpty(appointment.faerdig_pct_ex_montage_nu);
  row[19] = formatValueOrEmpty(appointment.faerdig_pct_ex_montage_foer);
  row[20] = formatValueOrEmpty(appointment.est_timer_ift_faerdig_pct);
  row[21] = formatValueOrEmpty(appointment.plus_minus_timer);
  
  // Add afsat fragt (transport) column
  row[22] = formatValueOrEmpty(appointment.afsat_fragt);
};

