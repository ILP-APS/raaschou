import React from "react";
import FokusarkDescription from "./FokusarkDescription";
import FrozenDataTable from "./FrozenDataTable";
const FokusarkContent: React.FC = () => {
  return <div className="flex flex-col gap-4 p-4 md:p-6 overflow-y-auto content-wrapper">
      <div className="flex flex-col gap-4 content-wrapper">
        <h2 className="text-2xl font-semibold tracking-tight">Fokusark</h2>
        <FokusarkDescription />
      </div>
      
      <div className="p-6 rounded-lg border border-border bg-card text-card-foreground shadow-sm">
        
        <FrozenDataTable />
      </div>
    </div>;
};
export default FokusarkContent;