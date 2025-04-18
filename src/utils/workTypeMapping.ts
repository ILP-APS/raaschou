
/**
 * Mapping of work type IDs to their respective categories
 */
export type WorkCategory = 'projektering' | 'produktion' | 'montage' | 'other';

// Map each work type ID to its appropriate category
const workTypeCategoryMap: Record<number, WorkCategory> = {
  // Projektering
  3585: 'projektering', // 10. Projektering
  4326: 'projektering', // Intern
  6759: 'projektering', // 14. Projekttid
  11591: 'projektering', // Tidsregistrering
  
  // Produktion
  3568: 'produktion', // 07. CNC timer
  3576: 'produktion', // 08. Malertimer svend
  3578: 'produktion', // 06. Overarbejde ISS
  3579: 'produktion', // 03. Overarbejde 50% svendetimer
  3580: 'produktion', // 03. Overarbejde 50% lærlingetimer
  3581: 'produktion', // 09. Programeringstimer
  3583: 'produktion', // 01. Svendetimer
  3584: 'produktion', // 05. Timer ISS
  4306: 'produktion', // 01. Lærlingetimer
  4413: 'produktion', // 04. Overarbejde 100% lærlingetimer
  4414: 'produktion', // 04. Overarbejde 100% svendetimer
  4449: 'produktion', // 08. Malertimer lærling
  5065: 'produktion', // 11. Timer, arbejdsmand / Studentermedhjælper
  5712: 'produktion', // 12. Malertimer midlertidig medarbejdere
  5732: 'produktion', // 13. Lærlingetimer midlertidig medarbejdere
  6973: 'produktion', // 15. Arbejdsmand / Studentermedhjælper timer
  9301: 'produktion', // 07. CNC timer, ISS
  
  // Montage
  3577: 'montage', // 02. Montagetimer svende
  4307: 'montage', // 02. Montagetimer lærlinge
};

/**
 * Determines the category for a given work type ID
 */
export function getWorkTypeCategory(workTypeId: number): WorkCategory {
  return workTypeCategoryMap[workTypeId] || 'other';
}

/**
 * Optimized version of calculateRealizedHours to reduce unnecessary calculations
 * Groups hours by category (projektering, produktion, montage)
 */
export function calculateRealizedHours(lineWorkData: any[]): {
  projektering: number;
  produktion: number;
  montage: number;
  total: number;
} {
  // Initialize counters for each category
  const hours = {
    projektering: 0,
    produktion: 0,
    montage: 0,
    total: 0
  };
  
  // If no data provided, return zeros
  if (!lineWorkData || !Array.isArray(lineWorkData) || lineWorkData.length === 0) {
    return hours;
  }
  
  console.log(`Processing ${lineWorkData.length} line work entries`);
  
  // Optimize the loop by avoiding multiple lookups and calculations inside the loop
  for (const entry of lineWorkData) {
    // Skip entries with missing data
    if (!entry?.hnWorkTypeID || typeof entry.units !== 'number') {
      continue;
    }
    
    const workTypeId = entry.hnWorkTypeID;
    const units = entry.units || 0;
    
    // Get category for this work type using direct map lookup (faster)
    const category = workTypeCategoryMap[workTypeId] || 'other';
    
    // Add units to appropriate category using single-step increment
    hours[category] += units;
    
    // Log detailed info for debugging specific appointments
    if (entry.hnAppointmentID === 24375) {
      console.log(`Work type ${workTypeId} (${category}): ${units} units`);
    }
    
    // Add to total regardless of category
    hours.total += units;
  }
  
  console.log('Calculated realized hours:', hours);
  
  return hours;
}
