
import { useState, useEffect } from 'react';
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
    isLoading,
    isInitialized
  } = useTableInitialization(initialData);
  
  // Set up cell updates
  const { handleCellChange } = useCellUpdates(
    tableData,
    setTableData,
    appointments,
    setAppointments
  );
  
  // Debug logs to track data initialization and loading states
  useEffect(() => {
    console.log("useFokusarkTable state:", {
      initialDataLength: initialData?.length || 0,
      tableDataLength: tableData?.length || 0,
      isLoading,
      isInitialized,
      appointmentsCount: appointments?.length || 0
    });
  }, [initialData, tableData, isLoading, isInitialized, appointments]);
  
  // Return the data and functions needed by components
  return { tableData, isLoading, handleCellChange, isInitialized };
};
