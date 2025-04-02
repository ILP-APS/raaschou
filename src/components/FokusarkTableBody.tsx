
import React from "react";

interface FokusarkTableBodyProps {
  data: string[][];
}

const FokusarkTableBody: React.FC<FokusarkTableBodyProps> = ({ data }) => {
  return (
    <tbody className="bg-background divide-y divide-border">
      {data.map((row, rowIndex) => {
        // The last element in each row now indicates if it's a sub-appointment
        const rowType = row[row.length - 1];
        const isSubAppointment = rowType === 'sub-appointment';
        
        // Remove the row type indicator before rendering
        const displayRow = row.slice(0, row.length - 1);
        
        return (
          <tr 
            key={rowIndex} 
            className={`hover:bg-muted/50 ${isSubAppointment ? 'pl-4 bg-muted/20' : ''}`}
          >
            {displayRow.map((cell, cellIndex) => (
              <td 
                key={cellIndex} 
                className={`px-4 py-3 whitespace-nowrap text-sm ${
                  isSubAppointment && cellIndex === 0 ? 'pl-8' : ''
                }`}
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
