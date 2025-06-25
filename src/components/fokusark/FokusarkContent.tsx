
import React from "react";
import FokusarkDescription from "./FokusarkDescription";
import ProjectsTable from "./ProjectsTable";

const FokusarkContent: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-4 pb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Fokusark</h2>
        <FokusarkDescription />
      </div>
      
      <div className="flex-1">
        <ProjectsTable />
      </div>
    </div>
  );
};

export default FokusarkContent;
