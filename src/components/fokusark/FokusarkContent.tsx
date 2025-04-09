
import React from "react";
import FokusarkDescription from "./FokusarkDescription";
import { useFokusarkData } from "@/hooks/useFokusarkData";
import MinimalStickyTable from "./MinimalStickyTable";

const FokusarkContent: React.FC = () => {
  const { isLoading, data } = useFokusarkData();
  
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <div className="flex flex-col gap-4 pb-4">
          <h2 className="text-2xl font-semibold tracking-tight">Fokusark</h2>
          <FokusarkDescription />
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-4 pb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Fokusark</h2>
        <FokusarkDescription />
      </div>
      
      {/* Pass the data to MinimalStickyTable */}
      <MinimalStickyTable tableData={data} />
    </div>
  );
};

export default FokusarkContent;
