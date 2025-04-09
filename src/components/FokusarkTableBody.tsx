
import React from "react";

interface FokusarkTableBodyProps {
  data: string[][];
}

const FokusarkTableBody: React.FC<FokusarkTableBodyProps> = ({ data }) => {
  return (
    <div className="p-4">
      <p className="text-muted-foreground">Table body component (removed)</p>
      <p className="text-sm text-muted-foreground">Data rows: {data.length}</p>
    </div>
  );
};

export default FokusarkTableBody;
