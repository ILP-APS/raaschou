
import React from "react";
import TableActions from "./TableActions";
import FokusarkDescription from "./FokusarkDescription";
import FokusarkTable from "../FokusarkTable";
import { useFokusarkData } from "@/hooks/useFokusarkData";

const FokusarkContent: React.FC = () => {
  const { tableData, isLoading } = useFokusarkData();

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 overflow-y-auto content-wrapper">
      <div className="flex flex-col gap-4 content-wrapper">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold tracking-tight">Fokusark Table</h2>
          <TableActions tableData={tableData} />
        </div>
        <FokusarkDescription />
      </div>
      
      <FokusarkTable 
        data={tableData} 
      />
    </div>
  );
};

export default FokusarkContent;
