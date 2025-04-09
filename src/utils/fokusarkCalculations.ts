
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
