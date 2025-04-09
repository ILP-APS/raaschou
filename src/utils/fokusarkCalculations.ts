
/**
 * Main entry point for Fokusark calculations
 * Re-exports all calculation utilities from specialized modules
 */

// Re-export number formatting utilities
export {
  parseNumber,
  formatDanishNumber,
  hasRealValue
} from './numberFormatUtils';

// Re-export materialer calculations
export {
  calculateMaterialer
} from './materialsCalculations';

// Re-export projektering calculations
export {
  calculateProjektering
} from './projekteringCalculations';

// Re-export produktion calculations
export {
  calculateProduktion
} from './productionCalculations';

// Re-export montage calculations
export {
  calculateMontage
} from './montageCalculations';

// Re-export batch calculations
export {
  applyMaterialerCalculations,
  applyProjekteringCalculations,
  recalculateAllFields
} from './batchCalculations';

// Import necessary formatting utilities directly for internal use
import { parseNumber, formatDanishNumber } from './numberFormatUtils';

// Calculate the total from projektering, produktion, and montage
export const calculateTotal = (row: string[]): string => {
  // Get values from columns 9 (projektering_1), 10 (produktion), and 11 (montage_3)
  const projektering = parseNumber(row[9]);
  const produktion = parseNumber(row[10]);
  const montage = parseNumber(row[11]);
  
  // Sum them up
  const total = projektering + produktion + montage;
  
  return formatDanishNumber(total);
};

// Calculate Timer Tilbage (Estimeret Projektering - Realiseret Projektering)
export const calculateTimerTilbage = (row: string[]): string => {
  // Get values from column 9 (projektering_1 - Estimeret) and column 12 (projektering_2 - Realiseret)
  const estimatedProjektering = parseNumber(row[9]);
  const realizedProjektering = parseNumber(row[12]);
  
  console.log(`Calculating Timer Tilbage: ${estimatedProjektering} - ${realizedProjektering}`);
  
  // Calculate the difference
  const timerTilbage = estimatedProjektering - realizedProjektering;
  
  console.log(`Timer Tilbage result: ${timerTilbage}`);
  
  return formatDanishNumber(timerTilbage);
};
