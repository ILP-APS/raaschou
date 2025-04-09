
import React from "react";
import FokusarkDescription from "./FokusarkDescription";
import { useFokusarkData } from "@/hooks/useFokusarkData";

const FokusarkContent: React.FC = () => {
  const { isLoading } = useFokusarkData();
  
  return (
    <div className="flex flex-col gap-4 md:p-6 overflow-y-auto content-wrapper">
      <div className="flex flex-col gap-4 content-wrapper">
        <h2 className="text-2xl font-semibold tracking-tight">Fokusark</h2>
        <FokusarkDescription />
      </div>
      
      <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Table functionality removed</h3>
          <p className="text-muted-foreground">
            The table has been completely removed from the application.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FokusarkContent;
