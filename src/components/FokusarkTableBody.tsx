
import React from "react";

interface FokusarkTableBodyProps {
  data: string[][];
}

const FokusarkTableBody: React.FC<FokusarkTableBodyProps> = ({ data }) => {
  return (
    <tbody className="bg-background divide-y divide-border">
      {data.map((row, rowIndex) => (
        <tr key={rowIndex} className="hover:bg-muted/50">
          {row.map((cell, cellIndex) => (
            <td 
              key={cellIndex} 
              className="px-4 py-3 whitespace-nowrap text-sm"
            >
              {cell}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
};

export default FokusarkTableBody;
