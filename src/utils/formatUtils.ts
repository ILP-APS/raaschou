
/**
 * Format a number to Danish locale format (comma as decimal separator, period as thousands separator)
 */
export const formatDanishNumber = (value: number): string => {
  // Check for NaN
  if (isNaN(value)) return '0,00';

  return value.toLocaleString('da-DK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * Format a number as Danish currency with DKK suffix
 */
export const formatDanishCurrency = (value: number): string => {
  // Check for NaN
  if (isNaN(value)) return '0 DKK';

  // Format using Danish locale rules without decimal places
  const formattedValue = value.toLocaleString('da-DK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return `${formattedValue} DKK`;
};
