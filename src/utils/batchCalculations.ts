
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
  console.log("Running batch projektering calculations on data rows:", data.length);
  return data.map(row => {
    const rowCopy = [...row];
    // Projektering is at index 9
    const projekteringValue = calculateProjektering(row);
    rowCopy[9] = projekteringValue;
    console.log(`Calculated projektering for appointment ${row[0]}: ${projekteringValue}`);
    return rowCopy;
  });
};

/**
 * Recalculate all calculated fields for a dataset
 */
export const recalculateAllFields = (data: string[][]): string[][] => {
  let result = [...data];
  result = applyMaterialerCalculations(result);
  result = applyProjekteringCalculations(result);
  return result;
};
