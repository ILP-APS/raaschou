
import React from "react";
import FokusarkDescription from "./FokusarkDescription";
import { useFokusarkData } from "@/hooks/useFokusarkData";
import StickyTable from "./StickyTable";
import "./StickyTableStyles.css";

const FokusarkContent: React.FC = () => {
  const { isLoading } = useFokusarkData();
  
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 overflow-y-auto content-wrapper">
      <div className="flex flex-col gap-4 content-wrapper">
        <h2 className="text-2xl font-semibold tracking-tight">Fokusark</h2>
        <FokusarkDescription />
      </div>
      
      <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="p-0">
            <StickyTable />
          </div>
        )}
      </div>
    </div>
  );
};

export default FokusarkContent;
