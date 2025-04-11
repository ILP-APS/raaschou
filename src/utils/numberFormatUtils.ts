
/**
 * Utilities for formatting and parsing numbers
 */

/**
 * Parses a string value representing a Danish number format into a numeric value
 * Handles Danish number format with comma as decimal separator and period as thousands separator
 * Also handles plain numbers with no separators
 */
export const parseNumber = (value: string): number => {
  if (!value || value.trim() === '') return 0;
  
  // Check if the value looks like a real number format (contains digits)
  if (!/\d/.test(value)) return 0;
  
  console.log(`Starting number parsing: "${value}"`);
  
  // Remove "DKK" suffix if present
  const withoutDKK = value.replace(/ DKK$/, '').trim();
  
  // Check if it's a plain number with no separators
  if (/^\d+$/.test(withoutDKK)) {
    const result = parseInt(withoutDKK, 10);
    console.log(`Parsed plain number: "${value}" -> "${withoutDKK}" -> ${result}`);
    return result;
  }
  
  // Danish format uses period as thousands separator and comma as decimal
  // We need to remove all periods and replace comma with dot for JavaScript parsing
  const cleanValue = withoutDKK.replace(/\./g, '').replace(',', '.');
  
  // Add debug log to track the transformation
  console.log(`Parsing formatted number: "${value}" -> "${withoutDKK}" -> "${cleanValue}"`);
  
  const result = parseFloat(cleanValue);
  
  // Add debug log for special values
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
