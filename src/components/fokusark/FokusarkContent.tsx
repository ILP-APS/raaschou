
import React from "react";
import FokusarkDescription from "./FokusarkDescription";

const FokusarkContent: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-4 pb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Fokusark</h2>
        <FokusarkDescription />
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-medium text-muted-foreground">Table Ready for Rebuild</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            The previous table implementation has been removed. 
            Ready to build a new table from scratch with your requirements.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FokusarkContent;
