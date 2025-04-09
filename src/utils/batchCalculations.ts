
import { calculateMaterialer } from './materialsCalculations';
import { calculateProjektering } from './projekteringCalculations';

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

/**
 * Apply Projektering calculation to all rows in a dataset
 */
export const applyProjekteringCalculations = (data: string[][]): string[][] => {
  return data.map(row => {
    const rowCopy = [...row];
    // Projektering is at index 9
    rowCopy[9] = calculateProjektering(row);
    return rowCopy;
  });
};
