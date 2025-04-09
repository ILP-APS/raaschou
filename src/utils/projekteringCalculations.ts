
import { parseNumber, formatDanishNumber, hasRealValue } from './numberFormatUtils';

/**
 * Calculate Projektering based on the formula: ((tilbud-Montage)*0.10)/830
 * If Montage 2 has a numeric value, use it, otherwise use the original Montage column
 */
export const calculateProjektering = (row: string[]): string => {
  try {
    // Get values from relevant columns
    const tilbudStr = row[3] || '0';
    const montageStr = row[4] || '0';
    const montage2Str = row[6] || '';
    
    console.log("Raw input for Projektering calculation:", {
      tilbud: tilbudStr,
      montage: montageStr,
      montage2: montage2Str,
      appointment: row[0] // Log the appointment number for debugging
    });
    
    // Parse values to numbers
    const tilbud = parseNumber(tilbudStr);
    const montage = parseNumber(montageStr);
    
    // For Montage 2, check if it actually contains a numeric value
    // and not just a placeholder like "R1C7"
    let montage2 = 0;
    const hasMontage2Value = hasRealValue(montage2Str);
    
    if (hasMontage2Value) {
      montage2 = parseNumber(montage2Str);
    }
    
    // Determine which montage value to use in the calculation
    const montageValue = hasMontage2Value ? montage2 : montage;
    
    console.log("Using values for Projektering calculation:", {
      tilbud,
      montageValue,
      appointment: row[0]
    });
    
    // Perform the calculation using the formula: ((tilbud-Montage)*0.10)/830
    const step1 = tilbud - montageValue;
    const step2 = step1 * 0.10;
    const projektering = step2 / 830;
    
    console.log("Projektering calculation steps:", {
      step1_tilbud_minus_montage: step1,
      step2_multiply_by_010: step2,
      step3_divide_by_830: projektering,
      appointment: row[0]
    });
    
    // Check for NaN and return '0' if the calculation resulted in NaN
    if (isNaN(projektering)) {
      console.log(`Projektering result is NaN for appointment ${row[0]}, returning 0`);
      return '0';
    }
    
    // Format the result with the Danish number format
    return formatDanishNumber(projektering);
  } catch (error) {
    console.error(`Error calculating Projektering for appointment ${row[0]}:`, error);
    return '0';
  }
};
