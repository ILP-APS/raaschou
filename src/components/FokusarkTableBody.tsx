
import React from "react";

interface FokusarkTableBodyProps {
  data: string[][];
}

const FokusarkTableBody: React.FC<FokusarkTableBodyProps> = ({ data }) => {
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

  // Determine the expected number of columns (excluding the row type indicator)
  const expectedColumns = 24; // Adjusted from 26 to 24 (removed the extra blank column)

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
            {displayRow.map((cell, cellIndex) => (
              <td 
                key={cellIndex} 
                className={getCellClass(cellIndex, isSubAppointment)}
              >
                {cell}
              </td>
            ))}
          </tr>
        );
      })}
    </tbody>
  );
};

export default FokusarkTableBody;
