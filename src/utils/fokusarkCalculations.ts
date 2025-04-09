
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
    console.log("Calculating Materialer for row:", JSON.stringify(row));
    
    // Get values from relevant columns
    const tilbudStr = row[3] || '0';
    const montageStr = row[4] || '0';
    const underleverandorStr = row[5] || '0';
    const montage2Str = row[6] || '';
    const underleverandor2Str = row[7] || '';
    
    console.log("Raw values:", {
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
    const montage2 = parseNumber(montage2Str);
    const underleverandor2 = parseNumber(underleverandor2Str);
    
    console.log("Parsed values:", {
      tilbud,
      montage,
      underleverandor,
      montage2,
      underleverandor2
    });
    
    // Determine which values to use in calculation
    // Only use Montage 2 and Underleverandør 2 if they are actual numbers (not placeholders like "R1C7")
    const useMontage2 = montage2Str && /\d/.test(montage2Str);
    const useUnderleverandor2 = underleverandor2Str && /\d/.test(underleverandor2Str);
    
    const montageValue = useMontage2 ? montage2 : montage;
    const underleverandorValue = useUnderleverandor2 ? underleverandor2 : underleverandor;
    
    console.log("Using values:", {
      tilbud,
      montage: montageValue,
      underleverandor: underleverandorValue,
      useMontage2,
      useUnderleverandor2
    });
    
    // Calculate using the corrected formula: ((Tilbud - Montage) - Underleverandør) * 0.25
    const materialer = ((tilbud - montageValue) - underleverandorValue) * 0.25;
    
    console.log("Materialer calculation result:", materialer);
    
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
