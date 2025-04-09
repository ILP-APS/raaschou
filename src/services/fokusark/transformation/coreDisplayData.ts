
import { FokusarkAppointment } from "@/api/fokusarkAppointmentsApi";
import { formatDanishNumber } from "@/utils/formatUtils";
import { formatValueOrEmpty } from "./helpers";

/**
 * Add core appointment data (first 8 columns)
 */
export const addCoreAppointmentData = (appointment: FokusarkAppointment): string[] => {
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

