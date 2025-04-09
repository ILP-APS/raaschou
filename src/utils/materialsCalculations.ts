
import { parseNumber, formatDanishNumber, hasRealValue } from './numberFormatUtils';

/**
 * Calculate Materialer based on the formula: ((Tilbud - Montage) - Underleverandør) * 0.25
 * If Montage 2 and Underleverandør 2 have numeric values, use them, otherwise use the original columns
 */
export const calculateMaterialer = (row: string[]): string => {
  try {
    // Get values from relevant columns
    const tilbudStr = row[3] || '0';
    const montageStr = row[4] || '0';
    const underleverandorStr = row[5] || '0';
    const montage2Str = row[6] || '';
    const underleverandor2Str = row[7] || '';
    
    console.log("Raw input for Materialer calculation:", {
      tilbud: tilbudStr,
      montage: montageStr,
      underleverandor: underleverandorStr,
      montage2: montage2Str,
      underleverandor2: underleverandor2Str
    });
    
    // Parse all values to numbers
    const tilbud = parseNumber(tilbudStr);
    const montage = parseNumber(montageStr);
    const underleverandor = parseNumber(underleverandorStr);
    
    // For Montage 2 and Underleverandør 2, check if they actually contain numeric values
    // and not just placeholders like "R1C7"
    let montage2 = 0;
    let underleverandor2 = 0;
    
    const hasMontage2Value = hasRealValue(montage2Str);
    const hasUnderleverandor2Value = hasRealValue(underleverandor2Str);
    
    if (hasMontage2Value) {
      montage2 = parseNumber(montage2Str);
    }
    
    if (hasUnderleverandor2Value) {
      underleverandor2 = parseNumber(underleverandor2Str);
    }
    
    console.log("Parsed values:", {
      tilbud,
      montage,
      underleverandor,
      montage2,
      underleverandor2,
      hasMontage2Value,
      hasUnderleverandor2Value
    });
    
    // Determine which values to use in calculation - ONLY use Montage 2 and Underleverandør 2
    // if they actually contain valid numeric values (not placeholders)
    const montageValue = hasMontage2Value ? montage2 : montage;
    const underleverandorValue = hasUnderleverandor2Value ? underleverandor2 : underleverandor;
    
    console.log("Using values for calculation:", {
      tilbud,
      montage: montageValue,
      underleverandor: underleverandorValue
    });
    
    // Perform the calculation using the formula: ((Tilbud - Montage) - Underleverandør) * 0.25
    const step1 = tilbud - montageValue;
    const step2 = step1 - underleverandorValue;
    const materialer = step2 * 0.25;
    
    console.log("Calculation steps:", {
      step1_tilbud_minus_montage: step1,
      step2_minus_underleverandor: step2,
      step3_multiply_by_025: materialer
    });
    
    // Check for NaN and return '0' if the calculation resulted in NaN
    if (isNaN(materialer)) {
      console.log("Result is NaN, returning 0");
      return '0';
    }
    
    // Format the result with the Danish number format
    return formatDanishNumber(materialer);
  } catch (error) {
    console.error('Error calculating Materialer:', error);
    return '0';
  }
};
