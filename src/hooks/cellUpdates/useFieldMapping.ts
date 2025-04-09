
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
        return 'produktion_2'; // Realized produktion
      case 14:
        return 'montage_4'; // Realized montage
      case 15:
        return 'realized_total'; // Realized total
      case 16:
        return 'timer_tilbage_1';
      case 17:
        return 'faerdig_pct_ex_montage_nu';
      case 18:
        return 'faerdig_pct_ex_montage_foer';
      case 19:
        return 'est_timer_ift_faerdig_pct';
      case 20:
        return 'plus_minus_timer';
      case 21:
        return 'timer_tilbage_2';
      case 22:
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
        return 'Timer tilbage';
      case 17:
        return 'Færdig % ex montage nu';
      case 18:
        return 'Færdig % ex montage før';
      case 19:
        return 'Est timer ift færdig %';
      case 20:
        return '+/- timer';
      case 21:
        return 'Timer tilbage';
      case 22:
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
