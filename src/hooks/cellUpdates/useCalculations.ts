
import { calculateProjektering, calculateProduktion, parseNumber } from "@/utils/fokusarkCalculations";
import { updateAppointmentField } from "@/services/fokusarkAppointmentService";

/**
 * Hook to handle field calculations after cell changes
 */
export const useCalculations = () => {
  // Recalculate Projektering when relevant fields change
  const recalculateProjektering = async (
    appointmentNumber: string,
    updatedRow: string[]
  ) => {
    console.log("Recalculating Projektering");
    
    // Use the common calculation function for consistency
    const projekteringValue = calculateProjektering(updatedRow);
    const projekteringNumericValue = parseNumber(projekteringValue);
    
    console.log(`Calculated new projektering value: ${projekteringValue} (${projekteringNumericValue}) for appointment ${appointmentNumber}`);
    
    // Update Supabase with the calculated value
    await updateAppointmentField(
      appointmentNumber, 
      'projektering_1', 
      projekteringNumericValue
    );
    
    console.log(`Updated projektering_1 in database to ${projekteringNumericValue}`);
    
    return { projekteringValue, projekteringNumericValue };
  };
  
  // Recalculate Produktion when relevant fields change
  const recalculateProduktion = async (
    appointmentNumber: string,
    updatedRow: string[]
  ) => {
    console.log("Recalculating Produktion");
    
    // Calculate produktion
    const produktionValue = calculateProduktion(updatedRow);
    const produktionNumericValue = parseNumber(produktionValue);
    
    console.log(`Calculated new produktion value: ${produktionValue} (${produktionNumericValue}) for appointment ${appointmentNumber}`);
    
    // Update Supabase with the calculated value
    await updateAppointmentField(
      appointmentNumber, 
      'produktion', 
      produktionNumericValue
    );
    
    console.log(`Updated produktion in database to ${produktionNumericValue}`);
    
    return { produktionValue, produktionNumericValue };
  };
  
  return { recalculateProjektering, recalculateProduktion };
};
