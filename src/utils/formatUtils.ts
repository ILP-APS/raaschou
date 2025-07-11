
/**
 * Format a number to Danish locale format (comma as decimal separator, period as thousands separator)
 */
export const formatDanishNumber = (value: number): string => {
  // Check for NaN
  if (isNaN(value)) return '0';

  return value.toLocaleString('da-DK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
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

/**
 * Extract initials from a full name
 * Examples: "Mads Raaschou" -> "MR", "Magnus Bo Andersen" -> "MBA"
 */
export const extractInitials = (fullName: string | null): string => {
  if (!fullName || fullName.trim() === '') return '-';
  
  return fullName
    .trim()
    .split(' ')
    .map(name => name.charAt(0).toUpperCase())
    .join('');
};
