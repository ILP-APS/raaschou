
import React from "react";

const FokusarkTableLoading: React.FC = () => {
  return (
    <div className="rounded-md border w-full overflow-hidden main-content flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-sm text-muted-foreground">Loading saved data...</p>
      </div>
    </div>
  );
};

export default FokusarkTableLoading;
