
/**
 * Maps work type IDs to categories (Projektering, Produktion, Montage)
 */

export enum WorkTypeCategory {
  Projektering = 'projektering',
  Produktion = 'produktion',
  Montage = 'montage',
  Unknown = 'unknown'
}

// Work type mapping based on provided information
const workTypeMap = new Map<number, WorkTypeCategory>([
  // Projektering work types
  [3585, WorkTypeCategory.Projektering],  // 10. Projektering
  [4326, WorkTypeCategory.Projektering],  // Intern
  [6759, WorkTypeCategory.Projektering],  // 14. Projekttid
  [11591, WorkTypeCategory.Projektering], // Tidsregistrering
  
  // Montage work types
  [3577, WorkTypeCategory.Montage],  // 02. Montagetimer svende
  [4307, WorkTypeCategory.Montage],  // 02. Montagetimer lærlinge
  
  // All other work types are categorized as Produktion
  [3568, WorkTypeCategory.Produktion],  // 07. CNC timer
  [3576, WorkTypeCategory.Produktion],  // 08. Malertimer svend
  [3578, WorkTypeCategory.Produktion],  // 06. Overarbejde ISS
  [3579, WorkTypeCategory.Produktion],  // 03. Overarbejde 50% svendetimer
  [3580, WorkTypeCategory.Produktion],  // 03. Overarbejde 50% lærlingetimer
  [3581, WorkTypeCategory.Produktion],  // 09. Programeringstimer
  [3583, WorkTypeCategory.Produktion],  // 01. Svendetimer
  [3584, WorkTypeCategory.Produktion],  // 05. Timer ISS
  [4306, WorkTypeCategory.Produktion],  // 01. Lærlingetimer
  [4413, WorkTypeCategory.Produktion],  // 04. Overarbejde 100% lærlingetimer
  [4414, WorkTypeCategory.Produktion],  // 04. Overarbejde 100% svendetimer
  [4449, WorkTypeCategory.Produktion],  // 08. Malertimer lærling
  [5065, WorkTypeCategory.Produktion],  // 11. Timer, arbejdsmand / Studentermedhjælper
  [5712, WorkTypeCategory.Produktion],  // 12. Malertimer midlertidig medarbejdere
  [5732, WorkTypeCategory.Produktion],  // 13. Lærlingetimer midlertidig medarbejdere
  [6973, WorkTypeCategory.Produktion],  // 15. Arbejdsmand / Studentermedhjælper timer
  [9301, WorkTypeCategory.Produktion],  // 07. CNC timer, ISS
]);

/**
 * Gets the category for a specific work type ID
 * 
 * @param workTypeId The work type ID to categorize
 * @returns The category of the work type
 */
export const getWorkTypeCategory = (workTypeId: number): WorkTypeCategory => {
  return workTypeMap.get(workTypeId) || WorkTypeCategory.Unknown;
};

/**
 * Calculates the realized hours for different categories from appointment line work data
 */
export const calculateRealizedHours = (lineWorkData: any[]): {
  projektering: number;
  produktion: number;
  montage: number;
  total: number;
} => {
  let projektering = 0;
  let produktion = 0;
  let montage = 0;
  
  // Process each line work item
  for (const item of lineWorkData) {
    const workTypeId = item.hnWorkTypeID;
    const units = parseFloat(item.units) || 0;
    
    // Categorize and accumulate units
    switch (getWorkTypeCategory(workTypeId)) {
      case WorkTypeCategory.Projektering:
        projektering += units;
        break;
      case WorkTypeCategory.Produktion:
        produktion += units;
        break;
      case WorkTypeCategory.Montage:
        montage += units;
        break;
      default:
        console.warn(`Unknown work type ID: ${workTypeId}`);
        break;
    }
  }
  
  // Calculate the total
  const total = projektering + produktion + montage;
  
  return {
    projektering,
    produktion,
    montage,
    total
  };
};
