
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
