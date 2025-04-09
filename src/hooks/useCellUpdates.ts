
import { FokusarkAppointment } from "@/api/fokusarkAppointmentsApi";
import { Dispatch, SetStateAction } from 'react';
import { useCellChange } from "./cellUpdates/useCellChange";

/**
 * Main hook for handling table cell updates
 * This hook composes smaller, focused hooks to handle cell updates
 */
export const useCellUpdates = (
  tableData: string[][],
  setTableData: React.Dispatch<React.SetStateAction<string[][]>>,
  appointments: FokusarkAppointment[],
  setAppointments: React.Dispatch<React.SetStateAction<FokusarkAppointment[]>>
) => {
  // Use the cell change hook to handle all update logic
  const { handleCellChange } = useCellChange({
    tableData,
    setTableData,
    setAppointments
  });
  
  return { handleCellChange };
};
