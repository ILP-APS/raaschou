
import { parseNumber, formatDanishNumber, hasRealValue } from './numberFormatUtils';

/**
 * Calculate Produktion based on the formula:
 * (Tilbud - Montage - Underleverandør - Materialer)/750-Projektering
 * If Montage 2 and Underleverandør 2 have numeric values, use them
 */
export const calculateProduktion = (row: string[]): string => {
  try {
    // Get values from relevant columns
    const appointmentNumber = row[0] || 'unknown';
    const tilbudStr = row[3] || '0';
    const montageStr = row[4] || '0';
    const underleverandorStr = row[5] || '0';
    const montage2Str = row[6] || '';
    const underleverandor2Str = row[7] || '';
    const materialerStr = row[8] || '0'; // Materialer at index 8
    const projekteringStr = row[9] || '0'; // Projektering at index 9
    
    console.log(`[DEBUG ESTIMATED PRODUCTION] Produktion calculation for ${appointmentNumber}:`, {
      rawInputs: {
        tilbud: tilbudStr,
        montage: montageStr,
        underleverandor: underleverandorStr,
        montage2: montage2Str,
        underleverandor2: underleverandor2Str,
        materialer: materialerStr,
        projektering: projekteringStr
      }
    });
    
    // Parse values to numbers
    const tilbud = parseNumber(tilbudStr);
    const montage = parseNumber(montageStr);
    const underleverandor = parseNumber(underleverandorStr);
    const materialer = parseNumber(materialerStr);
    const projektering = parseNumber(projekteringStr);
    
    // For Montage 2 and Underleverandør 2, check if they actually contain numeric values
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
    
    // Determine which montage and underleverandor values to use
    const montageValue = hasMontage2Value ? montage2 : montage;
    const underleverandorValue = hasUnderleverandor2Value ? underleverandor2 : underleverandor;
    
    console.log(`[DEBUG ESTIMATED PRODUCTION] Parsed values for ${appointmentNumber}:`, {
      tilbud,
      montage,
      montage2,
      montageValue,
      underleverandor,
      underleverandor2,
      underleverandorValue,
      materialer,
      projektering
    });
    
    // Perform the calculation using the formula:
    // (Tilbud - Montage - Underleverandør - Materialer)/750-Projektering
    const step1 = tilbud - montageValue - underleverandorValue - materialer;
    const step2 = step1 / 750;
    const produktion = step2 - projektering;
    
    console.log(`[DEBUG ESTIMATED PRODUCTION] Produktion calculation steps for ${appointmentNumber}:`, {
      step1_subtraction: `${tilbud} - ${montageValue} - ${underleverandorValue} - ${materialer} = ${step1}`,
      step2_divide_by_750: `${step1} / 750 = ${step2}`,
      final_result: `${step2} - ${projektering} = ${produktion}`
    });
    
    // Special debug for appointment 24258
    if (appointmentNumber === '24258') {
      console.log(`[CRITICAL DEBUG] Calculation for appointment 24258:`, {
        tilbud,
        montageValue,
        underleverandorValue,
        materialer,
        step1,
        step2,
        projektering,
        produktion,
        formula: `(${tilbud} - ${montageValue} - ${underleverandorValue} - ${materialer})/750 - ${projektering} = ${produktion}`
      });
    }
    
    // Check for NaN and return '0' if the calculation resulted in NaN
    if (isNaN(produktion)) {
      console.log(`[ERROR] Produktion result is NaN for ${appointmentNumber}, returning 0`);
      return '0,00';
    }
    
    // Format the result with the Danish number format
    const formattedValue = formatDanishNumber(produktion);
    console.log(`[DEBUG ESTIMATED PRODUCTION] Final formatted produktion for ${appointmentNumber}: ${formattedValue}`);
    return formattedValue;
  } catch (error) {
    console.error(`[ERROR] Error calculating Produktion for ${row[0]}:`, error);
    return '0,00';
  }
};
