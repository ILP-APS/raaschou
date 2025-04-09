
import React, { useEffect, useState } from "react";
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
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  
  // Determine the number of columns based on the first row of data
  const columnCount = tableData.length > 0 ? tableData[0].length - 1 : 0; // Subtract 1 for the row type indicator

  // Show loading state while fetching data
  if (isLoading) {
    return <FokusarkTableLoading />;
  }

  // Handle row hover synchronization between tables
  const handleRowHover = (index: number | null) => {
    setHoveredRow(index);
  };

  return (
    <>
      <style>{tableContainerStyles}</style>
      <div className="rounded-md w-full relative">
        <FokusarkTableScroll>
          <div className="fokusark-table-wrapper">
            {/* Frozen columns table (first two columns) */}
            <div className="frozen-columns">
              <table className="frozen-table">
                <FokusarkTableHeader columnCount={2} isFrozen={true} />
                <FokusarkTableBody 
                  data={tableData} 
                  onCellChange={handleCellChange}
                  columnCount={2}
                  isFrozen={true}
                  hoveredRow={hoveredRow}
                  onRowHover={handleRowHover}
                />
              </table>
            </div>
            
            {/* Main scrollable table */}
            <table className="fokusark-table">
              <FokusarkTableHeader columnCount={columnCount} />
              <FokusarkTableBody 
                data={tableData} 
                onCellChange={handleCellChange}
                columnCount={columnCount}
                hoveredRow={hoveredRow}
                onRowHover={handleRowHover}
              />
            </table>
          </div>
        </FokusarkTableScroll>
      </div>
    </>
  );
};

export default FokusarkTable;
