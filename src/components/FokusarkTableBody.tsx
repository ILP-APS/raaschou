
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
    
    // Add special class for last column to ensure proper right border
    if (index === expectedColumns - 1) {
      classes += " border-r border-border";
    }
    
    return classes;
  };

  // Determine the expected number of columns (excluding the row type indicator)
  const expectedColumns = 25; // Keep at 25 to include Mont 2

  return (
    <tbody className="bg-background divide-y divide-border">
      {data.map((row, rowIndex) => {
        // The last element in each row indicates if it's a sub-appointment
        const rowType = row[row.length - 1];
        const isSubAppointment = rowType === 'sub-appointment';
        
        // Get actual display data (without the row type indicator)
        const displayRow = row.slice(0, row.length - 1);
        
        // Create an array of the right length if needed
        const normalizedRow = Array(expectedColumns).fill('');
        
        // Fill in the row with actual data where available
        displayRow.forEach((value, index) => {
          if (index < expectedColumns) {
            normalizedRow[index] = value;
          }
        });
        
        return (
          <tr 
            key={rowIndex} 
            className={`hover:bg-muted/50 ${isSubAppointment ? 'pl-4 bg-muted/20' : ''}`}
          >
            {normalizedRow.map((cell, cellIndex) => (
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
