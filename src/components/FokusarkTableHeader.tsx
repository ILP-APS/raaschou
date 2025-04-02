
import React from "react";

interface FokusarkTableHeaderProps {
  columnCount: number;
}

const FokusarkTableHeader: React.FC<FokusarkTableHeaderProps> = ({ columnCount }) => {
  // Function to get column name based on index
  const getColumnName = (index: number): string => {
    switch (index) {
      case 0:
        return "Nr.";
      case 1:
        return "Navn";
      default:
        return `Column ${index + 1}`;
    }
  };

  return (
    <thead className="bg-muted/50">
      <tr>
        {Array.from({ length: columnCount }, (_, index) => (
          <th 
            key={index} 
            className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap sticky top-0 bg-background border-b"
          >
            {getColumnName(index)}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default FokusarkTableHeader;
