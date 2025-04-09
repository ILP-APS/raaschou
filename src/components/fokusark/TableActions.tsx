
import React, { useContext } from "react";
import RefreshRealizedHoursButton from "./buttons/RefreshRealizedHoursButton";
import RecalculateValuesButton from "./buttons/RecalculateValuesButton";
import { FokusarkDataContext } from "@/contexts/FokusarkDataContext";

interface TableActionsProps {
  tableData: string[][];
}

const TableActions: React.FC<TableActionsProps> = ({ tableData }) => {
  return (
    <div className="flex gap-2">
      <RefreshRealizedHoursButton />
      <RecalculateValuesButton tableData={tableData} />
    </div>
  );
};

export default TableActions;
