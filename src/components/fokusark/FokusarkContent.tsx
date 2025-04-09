
import React from "react";
import FokusarkDescription from "./FokusarkDescription";

const FokusarkContent: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 overflow-y-auto content-wrapper">
      <div className="flex flex-col gap-4 content-wrapper">
        <h2 className="text-2xl font-semibold tracking-tight">Fokusark</h2>
        <FokusarkDescription />
      </div>
      
      <div className="p-6 rounded-lg border border-border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <h3 className="text-lg font-medium mb-2">Table has been removed</h3>
          <p className="text-muted-foreground max-w-md">
            The Fokusark table has been removed as requested. This space is now available for new content.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FokusarkContent;
