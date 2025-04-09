
import { parseNumber } from "@/utils/numberFormatUtils";
import { formatDanishNumber } from "@/utils/formatUtils";

/**
 * Format a numeric value for display, returning empty string if null
 */
export const formatValueOrEmpty = (value: number | null): string => {
  return value !== null ? formatDanishNumber(value) : '';
};

/**
 * Checks if a string contains a numeric value and is not a placeholder
 */
export const isValidNumericValue = (value: string): boolean => {
  return /\d/.test(value) && !/R\d+C\d+/.test(value);
};

