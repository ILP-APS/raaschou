
import React from "react";

interface FokusarkTableHeaderProps {
  columnCount: number;
}

const FokusarkTableHeader: React.FC<FokusarkTableHeaderProps> = ({ columnCount }) => {
  return (
    <div className="p-4 border-b border-border">
      <h3 className="text-lg font-medium">Table Header (Removed)</h3>
      <p className="text-muted-foreground">Column count: {columnCount}</p>
    </div>
  );
};

export default FokusarkTableHeader;
