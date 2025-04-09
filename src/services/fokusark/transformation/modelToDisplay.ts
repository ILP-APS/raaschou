
import { FokusarkAppointment } from "@/api/fokusarkAppointmentsApi";
import { addCoreAppointmentData } from "./coreDisplayData";
import { addEstimatedValues } from "./estimatedValues";
import { addRealizedValues } from "./realizedValues";
import { addRemainingColumns } from "./remainingColumns";

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

