
import React from "react";
import FokusarkTable from "@/components/FokusarkTable";

interface FokusarkTableSectionProps {
  tableData: string[][];
  isLoading: boolean;
}

const FokusarkTableSection: React.FC<FokusarkTableSectionProps> = ({ 
  tableData, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return <FokusarkTable data={tableData} />;
};

export default FokusarkTableSection;
