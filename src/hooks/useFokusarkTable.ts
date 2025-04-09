
import { useTableInitialization } from './useTableInitialization';
import { useCellUpdates } from './useCellUpdates';

export interface FokusarkTableData {
  data: string[][];
  isLoading: boolean;
}

/**
 * Main hook for handling the Fokusark table functionality
 */
export const useFokusarkTable = (initialData: string[][]) => {
  // Initialize table data
  const { 
    tableData, 
    appointments, 
    setAppointments,
    setTableData, 
    isLoading 
  } = useTableInitialization(initialData);
  
  // Set up cell updates
  const { handleCellChange } = useCellUpdates(
    tableData,
    setTableData,
    appointments,
    setAppointments
  );
  
  // Return the data and functions needed by components
  return { tableData, isLoading, handleCellChange };
};
