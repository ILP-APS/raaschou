
import React from "react";
import FokusarkDescription from "./FokusarkDescription";
import MinimalStickyTable from "./MinimalStickyTable";
import { useFokusarkDb } from "@/hooks/useFokusarkDb";

const FokusarkContent: React.FC = () => {
  const { isLoading, tableData, saveCellChange, refreshData } = useFokusarkDb();
  
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
        <div className="flex justify-end">
          <button 
            onClick={refreshData}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Refresh Data
          </button>
        </div>
      </div>
      
      <MinimalStickyTable 
        tableData={tableData} 
        onCellChange={saveCellChange}
      />
    </div>
  );
};

export default FokusarkContent;
