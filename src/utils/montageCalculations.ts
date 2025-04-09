
import { parseNumber, formatDanishNumber, hasRealValue } from "./numberFormatUtils";

/**
 * Calculate Montage value using formula (Montage-(Montage*0.08))/630
 * Uses Montage2 if available, otherwise uses Montage
 */
export const calculateMontage = (rowData: string[]): string => {
  // Determine if we should use Montage2 (column 6) or Montage (column 4)
  const montageStr = rowData[4];
  const montage2Str = rowData[6];
  
  // Check if Montage2 has an actual value (not placeholder)
  const hasMontage2Value = hasRealValue(montage2Str);
  
  // Get the Montage value to use
  const montageValue = hasMontage2Value ? parseNumber(montage2Str) : parseNumber(montageStr);
  
  // Calculate: (Montage-(Montage*0.08))/630
  const montageAdjustment = montageValue * 0.08;
  const adjustedMontage = montageValue - montageAdjustment;
  const montageResult = adjustedMontage / 630;
  
  // Log calculation details for debugging
  console.log(`Montage calculation: (${montageValue} - (${montageValue} * 0.08)) / 630 = ${montageResult}`);
  
  return formatDanishNumber(montageResult);
};
