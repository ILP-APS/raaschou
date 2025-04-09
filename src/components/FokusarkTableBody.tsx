
import React from "react";
import { Input } from "@/components/ui/input";

interface FokusarkTableBodyProps {
  data: string[][];
  onCellChange?: (rowIndex: number, colIndex: number, value: string) => void;
}

const FokusarkTableBody: React.FC<FokusarkTableBodyProps> = ({ data, onCellChange }) => {
  // Function to get cell class based on column index
  const getCellClass = (index: number, isSubAppointment: boolean): string => {
    let classes = "px-4 py-3 whitespace-nowrap text-sm";
    
    // Add indentation for sub-appointments first column
    if (isSubAppointment && index === 0) {
      classes += " pl-8";
    }
    
    // Add sticky left positioning for first two columns only
    if (index === 0) {
      classes += " sticky left-0 z-10 bg-white"; // Solid white background
    } else if (index === 1) {
      classes += " sticky left-[100px] z-10 bg-white"; // Solid white background
    }
    
    return classes;
  };

  // Function to ensure all rows have the same number of columns
  const normalizeRow = (row: string[], expectedLength: number): string[] => {
    const displayRow = row.slice(0, row.length - 1); // Remove the row type indicator
    const rowType = row[row.length - 1];
    
    // Create a new array with the right length, filling in empty cells with placeholder data
    const normalizedRow = Array(expectedLength).fill('');
    
    // Copy values from the original row
    displayRow.forEach((value, index) => {
      if (index < expectedLength) {
        normalizedRow[index] = value;
      }
    });
    
    // Add the row type indicator back
    normalizedRow.push(rowType);
    
    return normalizedRow;
  };

  // Function to check if a cell is editable based on its column index
  const isEditableColumn = (columnIndex: number): boolean => {
    // Editable columns: Montage 2, Underleverandør 2, Projektering, Produktion, Montage, Timer tilbage,
    // Færdig % ex montage nu, Færdig % ex montage før, Est timer ift færdig %, +/- timer, Timer tilbage, Afsat fragt
    return [6, 7, 9, 10, 11, 14, 15, 16, 17, 18, 19, 20].includes(columnIndex);
  };

  // Function to render a cell - special handling for editable cells
  const renderCell = (rowIndex: number, cellIndex: number, cellValue: string, isSubAppointment: boolean) => {
    // If it's an editable column, make it editable
    if (isEditableColumn(cellIndex)) {
      return (
        <td key={cellIndex} className={getCellClass(cellIndex, isSubAppointment)}>
          <Input
            value={cellValue}
            onChange={(e) => onCellChange?.(rowIndex, cellIndex, e.target.value)}
            className="h-8 w-full border-0 bg-transparent focus:ring-1 focus:ring-primary"
          />
        </td>
      );
    }
    
    // Otherwise, render a regular cell
    return (
      <td 
        key={cellIndex} 
        className={getCellClass(cellIndex, isSubAppointment)}
      >
        {cellValue}
      </td>
    );
  };

  // Determine the expected number of columns (excluding the row type indicator)
  const expectedColumns = 25;

  return (
    <tbody className="bg-background divide-y divide-border">
      {data.map((row, rowIndex) => {
        // The last element in each row indicates if it's a sub-appointment
        const rowType = row[row.length - 1];
        const isSubAppointment = rowType === 'sub-appointment';
        
        // Normalize the row to ensure it has the expected number of columns
        const normalizedRow = normalizeRow(row, expectedColumns);
        
        // Remove the row type indicator before rendering
        const displayRow = normalizedRow.slice(0, normalizedRow.length - 1);
        
        return (
          <tr 
            key={rowIndex} 
            className={`hover:bg-muted/50 ${isSubAppointment ? 'pl-4 bg-muted/20' : ''}`}
          >
            {displayRow.map((cell, cellIndex) => 
              renderCell(rowIndex, cellIndex, cell, isSubAppointment)
            )}
          </tr>
        );
      })}
    </tbody>
  );
};

export default FokusarkTableBody;
