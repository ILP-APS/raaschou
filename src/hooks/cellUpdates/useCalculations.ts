
import { calculateProjektering, calculateProduktion, calculateMontage, calculateTimerTilbage, calculateProduktionTimerTilbage, parseNumber } from "@/utils/fokusarkCalculations";
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
    
    try {
      // Update Supabase with the calculated value
      await updateAppointmentField(
        appointmentNumber, 
        'produktion', 
        produktionNumericValue
      );
      
      console.log(`Updated produktion in database to ${produktionNumericValue}`);
      
      return { produktionValue, produktionNumericValue };
    } catch (error) {
      console.error(`Error updating produktion for ${appointmentNumber}:`, error);
      throw error;
    }
  };
  
  // Recalculate Montage when relevant fields change
  const recalculateMontage = async (
    appointmentNumber: string,
    updatedRow: string[]
  ) => {
    console.log("Recalculating Montage");
    
    // Use the common calculation function for consistency
    const montageValue = calculateMontage(updatedRow);
    const montageNumericValue = parseNumber(montageValue);
    
    console.log(`Calculated new montage value: ${montageValue} (${montageNumericValue}) for appointment ${appointmentNumber}`);
    
    // Update Supabase with the calculated value
    await updateAppointmentField(
      appointmentNumber, 
      'montage_3', 
      montageNumericValue
    );
    
    console.log(`Updated montage_3 in database to ${montageNumericValue}`);
    
    return { montageValue, montageNumericValue };
  };
  
  // Recalculate Timer Tilbage (Projektering - Realiseret Projektering)
  const recalculateTimerTilbage = async (
    appointmentNumber: string,
    updatedRow: string[]
  ) => {
    console.log("Recalculating Timer Tilbage");
    
    // Use the calculation function for timer tilbage
    const timerTilbageValue = calculateTimerTilbage(updatedRow);
    const timerTilbageNumericValue = parseNumber(timerTilbageValue);
    
    console.log(`Calculated new timer tilbage value: ${timerTilbageValue} (${timerTilbageNumericValue}) for appointment ${appointmentNumber}`);
    
    // Update Supabase with the calculated value
    await updateAppointmentField(
      appointmentNumber, 
      'timer_tilbage_1', 
      timerTilbageNumericValue
    );
    
    console.log(`Updated timer_tilbage_1 in database to ${timerTilbageNumericValue}`);
    
    return { timerTilbageValue, timerTilbageNumericValue };
  };
  
  // Recalculate Produktion Timer Tilbage (Produktion - Realiseret Produktion)
  const recalculateProduktionTimerTilbage = async (
    appointmentNumber: string,
    updatedRow: string[]
  ) => {
    console.log("Recalculating Produktion Timer Tilbage");
    
    // Use the calculation function for produktion timer tilbage
    const produktionTimerTilbageValue = calculateProduktionTimerTilbage(updatedRow);
    const produktionTimerTilbageNumericValue = parseNumber(produktionTimerTilbageValue);
    
    console.log(`Calculated new produktion timer tilbage value: ${produktionTimerTilbageValue} (${produktionTimerTilbageNumericValue}) for appointment ${appointmentNumber}`);
    
    // Update Supabase with the calculated value - using timer_tilbage_2 field
    await updateAppointmentField(
      appointmentNumber, 
      'timer_tilbage_2', 
      produktionTimerTilbageNumericValue
    );
    
    console.log(`Updated timer_tilbage_2 in database to ${produktionTimerTilbageNumericValue}`);
    
    return { produktionTimerTilbageValue, produktionTimerTilbageNumericValue };
  };
  
  return { 
    recalculateProjektering, 
    recalculateProduktion,
    recalculateMontage,
    recalculateTimerTilbage,
    recalculateProduktionTimerTilbage
  };
};
