
import { calculateMaterialer } from './materialsCalculations';
import { calculateProjektering } from './projekteringCalculations';
import { parseNumber, formatDanishNumber } from './numberFormatUtils';

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
    
    // Log detailed calculation for specific appointment number
    if (row[0] === '24371') {
      console.log(`DETAILED BATCH CALCULATION for appointment 24371:`);
      console.log(`Input values: Tilbud=${row[3]}, Montage=${row[4]}, Montage2=${row[6]}`);
      
      const tilbud = parseNumber(row[3]);
      const montage = parseNumber(row[4]);
      const montage2Str = row[6];
      const hasMontage2Value = !/^R\d+C\d+$/.test(montage2Str) && montage2Str.trim() !== '';
      const montage2 = hasMontage2Value ? parseNumber(montage2Str) : 0;
      
      console.log(`Parsed values: Tilbud=${tilbud}, Montage=${montage}, Montage2=${montage2}, Using Montage2=${hasMontage2Value}`);
      
      const montageValue = hasMontage2Value ? montage2 : montage;
      const step1 = tilbud - montageValue;
      const step2 = step1 * 0.10;
      const projektering = step2 / 830;
      
      console.log(`Calculation steps: (${tilbud} - ${montageValue}) * 0.1 / 830 = ${projektering}`);
      console.log(`Formatted result: ${formatDanishNumber(projektering)}`);
    }
    
    console.log(`Calculated projektering for appointment ${row[0]}: ${projekteringValue}`);
    return rowCopy;
  });
};

/**
 * Recalculate all calculated fields for a dataset
 */
export const recalculateAllFields = (data: string[][]): string[][] => {
  console.log("Starting full recalculation of all fields for", data.length, "rows");
  let result = [...data];
  result = applyMaterialerCalculations(result);
  result = applyProjekteringCalculations(result);
  console.log("Recalculation complete");
  return result;
};
