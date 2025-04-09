
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
        return 'timer_tilbage_1'; // Changed from projektering_rest to timer_tilbage_1
      case 17:
        return 'faerdig_pct_ex_montage_nu'; // Shifted one index down
      case 18:
        return 'faerdig_pct_ex_montage_foer'; // Shifted one index down
      case 19:
        return 'est_timer_ift_faerdig_pct'; // Shifted one index down
      case 20:
        return 'plus_minus_timer'; // Shifted one index down
      case 21:
        return 'timer_tilbage_2'; // Shifted one index down
      case 22:
        return 'afsat_fragt'; // Shifted one index down
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
        return 'Timer tilbage'; // Changed from "Projektering" to "Timer tilbage"
      case 17:
        return 'Færdig % ex montage nu'; // Shifted one index down
      case 18:
        return 'Færdig % ex montage før'; // Shifted one index down
      case 19:
        return 'Est timer ift færdig %'; // Shifted one index down
      case 20:
        return '+/- timer'; // Shifted one index down
      case 21:
        return 'Timer tilbage'; // Shifted one index down
      case 22:
        return 'Afsat fragt'; // Shifted one index down
      default:
        return `Kolonne ${columnIndex + 1}`;
    }
  };

  return {
    getFieldNameForColumn,
    getColumnDisplayName
  };
};
