
import React from "react";
import FokusarkTable from "@/components/FokusarkTable";

interface FokusarkContentProps {
  tableData: string[][];
  isLoading: boolean;
}

const FokusarkContent: React.FC<FokusarkContentProps> = ({ tableData, isLoading }) => {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 overflow-y-auto content-wrapper">
      <div className="flex flex-col gap-4 content-wrapper">
        <h2 className="text-2xl font-semibold tracking-tight">Fokusark Table</h2>
        <p className="text-sm text-muted-foreground mb-6">
          This table displays open appointments from e-regnskab with Nr., Subject, and Responsible Person.
          Only showing appointments that are not done and have a Tilbud value greater than 40,000 DKK.
          <br />
          <span className="text-primary font-medium">
            Materialer calculations are now automatically handled by the database.
          </span>
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <FokusarkTable data={tableData} />
      )}
    </div>
  );
};

export default FokusarkContent;
