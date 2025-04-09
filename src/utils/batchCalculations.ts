import { calculateMaterialer } from './materialsCalculations';
import { calculateProjektering } from './projekteringCalculations';
import { calculateProduktion } from './productionCalculations';
import { calculateMontage } from './montageCalculations';
import { parseNumber, formatDanishNumber, hasRealValue } from './numberFormatUtils';

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
      const hasMontage2Value = hasRealValue(montage2Str);
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
 * Apply Produktion calculation to all rows in a dataset
 */
export const applyProduktionCalculations = (data: string[][]): string[][] => {
  console.log("Running batch produktion calculations on data rows:", data.length);
  return data.map(row => {
    const rowCopy = [...row];
    // Produktion is at index 10
    const produktionValue = calculateProduktion(row);
    rowCopy[10] = produktionValue;
    
    // Log detailed calculation for specific appointment number
    if (row[0] === '24371') {
      console.log(`DETAILED BATCH CALCULATION for appointment 24371 produktion:`);
      
      const tilbud = parseNumber(row[3]);
      const montage = parseNumber(row[4]);
      const underleverandor = parseNumber(row[5]);
      const montage2Str = row[6];
      const underleverandor2Str = row[7];
      const materialer = parseNumber(row[8]);
      const projektering = parseNumber(row[9]);
      
      const hasMontage2Value = hasRealValue(montage2Str);
      const hasUnderleverandor2Value = hasRealValue(underleverandor2Str);
      
      const montage2 = hasMontage2Value ? parseNumber(montage2Str) : 0;
      const underleverandor2 = hasUnderleverandor2Value ? parseNumber(underleverandor2Str) : 0;
      
      const montageValue = hasMontage2Value ? montage2 : montage;
      const underleverandorValue = hasUnderleverandor2Value ? underleverandor2 : underleverandor;
      
      console.log(`Parsed values: Tilbud=${tilbud}, Montage=${montageValue}, Underleverandor=${underleverandorValue}, Materialer=${materialer}, Projektering=${projektering}`);
      
      const step1 = tilbud - montageValue - underleverandorValue - materialer;
      const step2 = step1 / 750;
      const produktion = step2 - projektering;
      
      console.log(`Calculation steps: (${tilbud} - ${montageValue} - ${underleverandorValue} - ${materialer}) / 750 - ${projektering} = ${produktion}`);
      console.log(`Formatted result: ${formatDanishNumber(produktion)}`);
    }
    
    console.log(`Calculated produktion for appointment ${row[0]}: ${produktionValue}`);
    return rowCopy;
  });
};

/**
 * Apply Montage calculation to all rows in a dataset
 */
export const applyMontageCalculations = (data: string[][]): string[][] => {
  console.log("Running batch montage calculations on data rows:", data.length);
  return data.map(row => {
    const rowCopy = [...row];
    // Montage is at index 11
    const montageValue = calculateMontage(row);
    rowCopy[11] = montageValue;
    
    // Log detailed calculation for specific appointment number
    if (row[0] === '24371') {
      console.log(`DETAILED BATCH CALCULATION for appointment 24371 montage:`);
      
      const montageStr = row[4];
      const montage2Str = row[6];
      const hasMontage2Value = hasRealValue(montage2Str);
      const montageValue = hasMontage2Value ? parseNumber(montage2Str) : parseNumber(montageStr);
      
      console.log(`Using montage value: ${montageValue}, Using Montage2: ${hasMontage2Value}`);
      
      const montageAdjustment = montageValue * 0.08;
      const adjustedMontage = montageValue - montageAdjustment;
      const montageResult = adjustedMontage / 630;
      
      console.log(`Calculation steps: (${montageValue} - (${montageValue} * 0.08)) / 630 = ${montageResult}`);
      console.log(`Formatted result: ${formatDanishNumber(montageResult)}`);
    }
    
    console.log(`Calculated montage for appointment ${row[0]}: ${montageValue}`);
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
  result = applyProduktionCalculations(result);
  result = applyMontageCalculations(result);
  console.log("Recalculation complete");
  return result;
};
