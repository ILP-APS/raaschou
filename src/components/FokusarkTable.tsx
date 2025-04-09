
import React from "react";
import FokusarkTableHeader from "./FokusarkTableHeader";
import FokusarkTableBody from "./FokusarkTableBody";
import FokusarkTableScroll from "./fokusark/FokusarkTableScroll";
import FokusarkTableLoading from "./fokusark/FokusarkTableLoading";
import { tableContainerStyles } from "./FokusarkTableStyles";
import { useFokusarkTable } from "@/hooks/useFokusarkTable";

interface FokusarkTableProps {
  data: string[][];
}

const FokusarkTable: React.FC<FokusarkTableProps> = ({ data }) => {
  const { tableData, isLoading, handleCellChange } = useFokusarkTable(data);
  
  // Determine the number of columns based on the first row of data
  const columnCount = tableData.length > 0 ? tableData[0].length : 0;

  // Show loading state while fetching data
  if (isLoading) {
    return <FokusarkTableLoading />;
  }

  return (
    <>
      <style>{tableContainerStyles}</style>
      <div className="rounded-md border w-full overflow-hidden main-content">
        <FokusarkTableScroll>
          <table className="table-auto border-collapse divide-y divide-border">
            <FokusarkTableHeader columnCount={columnCount} />
            <FokusarkTableBody 
              data={tableData} 
              onCellChange={handleCellChange}
            />
          </table>
        </FokusarkTableScroll>
      </div>
    </>
  );
};

export default FokusarkTable;
