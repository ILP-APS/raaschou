
import React, { useRef, useEffect } from "react";
import FokusarkTableHeader from "./FokusarkTableHeader";
import FokusarkTableBody from "./FokusarkTableBody";
import { tableContainerStyles } from "./FokusarkTableStyles";

interface FokusarkTableProps {
  data: string[][];
}

const FokusarkTable: React.FC<FokusarkTableProps> = ({ data }) => {
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const tableVerticalScrollRef = useRef<HTMLDivElement>(null);
  
  // Determine the number of columns based on the first row of data
  const columnCount = data.length > 0 ? data[0].length : 0;
  
  // Set up wheel event handling for horizontal scrolling
  useEffect(() => {
    const tableScroll = tableScrollRef.current;
    const tableVerticalScroll = tableVerticalScrollRef.current;
    
    if (!tableScroll || !tableVerticalScroll) return;
    
    const handleWheel = (e: WheelEvent) => {
      // Check if the event originated within the table container
      if (tableScroll.contains(e.target as Node)) {
        // Handle horizontal scrolling from trackpad or shift+wheel
        if (e.deltaX !== 0) {
          // Let the browser handle natural horizontal scroll within the container
          // but prevent it from propagating up to parent elements
          e.stopPropagation();
          return;
        }
        
        // Handle vertical scrolling
        if (e.deltaY !== 0) {
          // If shift is held, convert vertical scroll to horizontal
          if (e.shiftKey) {
            e.preventDefault();
            tableScroll.scrollLeft += e.deltaY;
          } else {
            // Handle vertical scrolling within table
            e.preventDefault();
            tableVerticalScroll.scrollTop += e.deltaY;
          }
        }
      }
    };
    
    // Add wheel event listener with non-passive option to allow preventDefault
    tableScroll.addEventListener('wheel', handleWheel, { passive: false });
    
    // Additionally, prevent any wheel events from reaching document
    const preventDocumentScroll = (e: WheelEvent) => {
      if (e.shiftKey && tableScroll.contains(e.target as Node)) {
        e.preventDefault();
      }
    };
    
    // Add document-level event listener to catch any events that might bubble up
    document.addEventListener('wheel', preventDocumentScroll, { passive: false });
    
    return () => {
      tableScroll.removeEventListener('wheel', handleWheel);
      document.removeEventListener('wheel', preventDocumentScroll);
    };
  }, []);

  return (
    <>
      <style>{tableContainerStyles}</style>
      <div className="rounded-md border w-full overflow-hidden main-content">
        {/* Vertical scroll container */}
        <div 
          ref={tableVerticalScrollRef}
          className="table-vertical-scroll"
        >
          {/* Horizontal scroll container - THIS IS THE ONLY ELEMENT THAT SHOULD SCROLL HORIZONTALLY */}
          <div 
            ref={tableScrollRef}
            className="table-scroll-container"
          >
            <table className="table-auto border-collapse divide-y divide-border w-auto">
              <FokusarkTableHeader columnCount={columnCount} />
              <FokusarkTableBody data={data} />
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default FokusarkTable;
