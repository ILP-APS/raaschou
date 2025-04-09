
import { FokusarkAppointment } from "@/api/fokusarkAppointmentsApi";
import { updateAppointmentField } from "@/services/fokusark/appointmentDbService";

/**
 * Hook for handling realized hours updates
 */
export const useRealizedHoursUpdate = () => {
  /**
   * Updates a single realized hours field in Supabase
   */
  const updateRealizedHoursField = async (
    appointmentNumber: string,
    field: string,
    value: number
  ): Promise<FokusarkAppointment | null> => {
    try {
      console.log(`Updating realized hours field ${field} for ${appointmentNumber} to ${value}`);
      
      const updatedAppointment = await updateAppointmentField(
        appointmentNumber,
        field,
        value
      );
      
      return updatedAppointment;
    } catch (error) {
      console.error(`Error updating realized hours field ${field} for ${appointmentNumber}:`, error);
      return null;
    }
  };
  
  return { updateRealizedHoursField };
};
