
/**
 * Utility functions for Fokusark calculations
 */

/**
 * Parses a string value representing a Danish number format into a numeric value
 * Handles Danish number format with comma as decimal separator and period as thousands separator
 */
export const parseNumber = (value: string): number => {
  if (!value || value.trim() === '') return 0;
  
  // Check if the value looks like a real number format (contains digits)
  if (!/\d/.test(value)) return 0;
  
  // Remove periods (thousands separators in Danish) and replace comma with dot
  const cleanValue = value.replace(/\./g, '').replace(',', '.');
  const result = parseFloat(cleanValue);
  return isNaN(result) ? 0 : result;
};

/**
 * Format a number to Danish locale format (comma as decimal separator, period as thousands separator)
 */
export const formatDanishNumber = (value: number): string => {
  // Check for NaN
  if (isNaN(value)) return '0';

  return value.toLocaleString('da-DK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

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
    
    const hasMontage2Value = montage2Str && /\d/.test(montage2Str) && !/R\d+C\d+/.test(montage2Str);
    const hasUnderleverandor2Value = underleverandor2Str && /\d/.test(underleverandor2Str) && !/R\d+C\d+/.test(underleverandor2Str);
    
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
      montage2: montage2Str
    });
    
    // Parse values to numbers
    const tilbud = parseNumber(tilbudStr);
    const montage = parseNumber(montageStr);
    
    // For Montage 2, check if it actually contains a numeric value
    // and not just a placeholder like "R1C7"
    let montage2 = 0;
    const hasMontage2Value = montage2Str && /\d/.test(montage2Str) && !/R\d+C\d+/.test(montage2Str);
    
    if (hasMontage2Value) {
      montage2 = parseNumber(montage2Str);
    }
    
    // Determine which montage value to use in the calculation
    const montageValue = hasMontage2Value ? montage2 : montage;
    
    console.log("Using values for Projektering calculation:", {
      tilbud,
      montage: montageValue
    });
    
    // Perform the calculation using the formula: ((tilbud-Montage)*0.10)/830
    const step1 = tilbud - montageValue;
    const step2 = step1 * 0.10;
    const projektering = step2 / 830;
    
    console.log("Projektering calculation steps:", {
      step1_tilbud_minus_montage: step1,
      step2_multiply_by_010: step2,
      step3_divide_by_830: projektering
    });
    
    // Check for NaN and return '0' if the calculation resulted in NaN
    if (isNaN(projektering)) {
      console.log("Projektering result is NaN, returning 0");
      return '0';
    }
    
    // Format the result with the Danish number format
    return formatDanishNumber(projektering);
  } catch (error) {
    console.error('Error calculating Projektering:', error);
    return '0';
  }
};

/**
 * Apply Materialer calculation to all rows in a dataset
 */
export const applyMaterialerCalculations = (data: string[][]): string[][] => {
  return data.map(row => {
    const rowCopy = [...row];
    // Materialer is at index 8
    rowCopy[8] = calculateMaterialer(row);
    return rowCopy;
  });
};

/**
 * Apply Projektering calculation to all rows in a dataset
 */
export const applyProjekteringCalculations = (data: string[][]): string[][] => {
  return data.map(row => {
    const rowCopy = [...row];
    // Projektering is at index 9
    rowCopy[9] = calculateProjektering(row);
    return rowCopy;
  });
};
