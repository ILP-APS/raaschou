
/**
 * Utilities for formatting and parsing numbers
 */

/**
 * Parses a string value representing a Danish number format into a numeric value
 * Handles Danish number format with comma as decimal separator and period as thousands separator
 */
export const parseNumber = (value: string): number => {
  if (!value || value.trim() === '') return 0;
  
  // Check if the value looks like a real number format (contains digits)
  if (!/\d/.test(value)) return 0;
  
  // Remove "DKK" suffix if present
  const withoutDKK = value.replace(/ DKK$/, '').trim();
  
  // Remove periods (thousands separators in Danish) and replace comma with dot
  const cleanValue = withoutDKK.replace(/\./g, '').replace(',', '.');
  const result = parseFloat(cleanValue);
  
  // Add debug log for special values like appointment 24371
  if (result > 1000000 || isNaN(result)) {
    console.log(`Special number parsing: "${value}" -> "${withoutDKK}" -> "${cleanValue}" -> ${result}`);
  }
  
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
 * Check if a value contains a numeric value and not just a placeholder like "R1C7"
 */
export const hasRealValue = (value: string): boolean => {
  return value && /\d/.test(value) && !/R\d+C\d+/.test(value);
}
