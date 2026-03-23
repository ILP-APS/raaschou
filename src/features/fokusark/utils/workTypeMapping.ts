
/**
 * Mapping of work type IDs to their respective categories
 */
export type WorkCategory = 'projektering' | 'produktion' | 'montage' | 'other';

const workTypeCategoryMap: Record<number, WorkCategory> = {
  3585: 'projektering',
  4326: 'projektering',
  6759: 'projektering',
  11591: 'projektering',
  3568: 'produktion',
  3576: 'produktion',
  3578: 'produktion',
  3579: 'produktion',
  3580: 'produktion',
  3581: 'produktion',
  3583: 'produktion',
  3584: 'produktion',
  4306: 'produktion',
  4413: 'produktion',
  4414: 'produktion',
  4449: 'produktion',
  5065: 'produktion',
  5712: 'produktion',
  5732: 'produktion',
  6973: 'produktion',
  9301: 'produktion',
  3577: 'montage',
  4307: 'montage',
};

export function getWorkTypeCategory(workTypeId: number): WorkCategory {
  return workTypeCategoryMap[workTypeId] || 'other';
}

export function calculateRealizedHours(lineWorkData: any[]): {
  projektering: number;
  produktion: number;
  montage: number;
  total: number;
} {
  const hours = { projektering: 0, produktion: 0, montage: 0, total: 0 };
  
  if (!lineWorkData || !Array.isArray(lineWorkData) || lineWorkData.length === 0) {
    return hours;
  }
  
  for (const entry of lineWorkData) {
    if (!entry?.hnWorkTypeID || typeof entry.units !== 'number') continue;
    const category = workTypeCategoryMap[entry.hnWorkTypeID] || 'other';
    hours[category] += entry.units;
    hours.total += entry.units;
  }
  
  return hours;
}
