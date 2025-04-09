
/**
 * Hook to map column indices to field names in the database
 */
export const useFieldMapping = () => {
  // Function to determine which field to update based on column index
  const getFieldNameForColumn = (colIndex: number): string | null => {
    switch (colIndex) {
      case 6:
        return 'montage2';
      case 7:
        return 'underleverandor2';
      case 9:
        return 'projektering_1';
      case 10:
        return 'produktion';
      case 11:
        return 'montage_3';
      case 14:
        return 'timer_tilbage_1';
      case 15:
        return 'faerdig_pct_ex_montage_nu';
      case 16:
        return 'faerdig_pct_ex_montage_foer';
      case 17:
        return 'est_timer_ift_faerdig_pct';
      case 18:
        return 'plus_minus_timer';
      case 19:
        return 'timer_tilbage_2';
      case 20:
        return 'afsat_fragt';
      default:
        return null;
    }
  };
  
  // Helper function to get column display name for toast messages
  const getColumnDisplayName = (colIndex: number): string => {
    switch (colIndex) {
      case 6:
        return 'Montage 2';
      case 7:
        return 'Underleverandør 2';
      case 9:
        return 'Projektering';
      case 10:
        return 'Produktion';
      case 11:
        return 'Montage';
      case 14:
        return 'Timer tilbage';
      case 15:
        return 'Færdig % ex montage nu';
      case 16:
        return 'Færdig % ex montage før';
      case 17:
        return 'Est timer ift færdig %';
      case 18:
        return '+/- timer';
      case 19:
        return 'Timer tilbage';
      case 20:
        return 'Afsat fragt';
      default:
        return `Column ${colIndex + 1}`;
    }
  };
  
  return { getFieldNameForColumn, getColumnDisplayName };
};
