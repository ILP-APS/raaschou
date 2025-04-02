
import React from "react";

interface FokusarkTableHeaderProps {
  columnCount: number;
}

const FokusarkTableHeader: React.FC<FokusarkTableHeaderProps> = ({ columnCount }) => {
  return (
    <thead className="bg-muted/50">
      <tr>
        {Array.from({ length: columnCount }, (_, index) => (
          <th 
            key={index} 
            className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap sticky top-0 bg-background border-b"
          >
            Column {index + 1}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default FokusarkTableHeader;
