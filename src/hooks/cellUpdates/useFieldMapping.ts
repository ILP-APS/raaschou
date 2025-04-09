
/**
 * Hook to map table column indices to field names and vice versa
 */
export const useFieldMapping = () => {
  // Map column indices to field names in the fokusark_appointments table
  const getFieldNameForColumn = (columnIndex: number): string | null => {
    switch (columnIndex) {
      case 3:
        return 'tilbud';
      case 4:
        return 'montage';
      case 5:
        return 'underleverandor';
      case 6:
        return 'montage2';
      case 7:
        return 'underleverandor2';
      case 8: 
        return 'materialer';
      case 9:
        return 'projektering_1';
      case 10:
        return 'produktion';
      case 11:
        return 'montage_3';
      case 12:
        return 'projektering_2'; // Realized projektering
      case 13:
        return 'produktion'; // Using the existing produktion field for realized produktion
      case 14:
        return 'montage_3'; // Using the existing montage_3 field for realized montage
      case 15:
        return 'total'; // Using the existing total field for realized total
      case 16:
        return 'projektering_rest'; // New field for projektering rest
      case 17:
        return 'produktion_rest'; // New field for produktion rest
      case 18:
        return 'timer_tilbage_1';
      case 19:
        return 'faerdig_pct_ex_montage_nu';
      case 20:
        return 'faerdig_pct_ex_montage_foer';
      case 21:
        return 'est_timer_ift_faerdig_pct';
      case 22:
        return 'plus_minus_timer';
      case 23:
        return 'timer_tilbage_2';
      case 24:
        return 'afsat_fragt';
      default:
        return null;
    }
  };

  // Get friendly display name for a column based on its index
  const getColumnDisplayName = (columnIndex: number): string => {
    switch (columnIndex) {
      case 0:
        return 'Nr';
      case 1:
        return 'Navn';
      case 2:
        return 'Ansvarlig';
      case 3:
        return 'Tilbud';
      case 4:
        return 'Montage';
      case 5:
        return 'Underleverandør';
      case 6:
        return 'Montage 2';
      case 7:
        return 'Underleverandør 2';
      case 8:
        return 'Materialer';
      case 9:
        return 'Projektering';
      case 10:
        return 'Produktion';
      case 11:
        return 'Montage';
      case 12:
        return 'Real. Projektering';
      case 13:
        return 'Real. Produktion';
      case 14:
        return 'Real. Montage';
      case 15:
        return 'Real. Total';
      case 16:
        return 'Projektering'; // Timer tilbage for Projektering
      case 17:
        return 'Produktion'; // Timer tilbage for Produktion
      case 18:
        return 'Timer tilbage';
      case 19:
        return 'Færdig % ex montage nu';
      case 20:
        return 'Færdig % ex montage før';
      case 21:
        return 'Est timer ift færdig %';
      case 22:
        return '+/- timer';
      case 23:
        return 'Timer tilbage';
      case 24:
        return 'Afsat fragt';
      default:
        return `Kolonne ${columnIndex + 1}`;
    }
  };

  return {
    getFieldNameForColumn,
    getColumnDisplayName
  };
};
