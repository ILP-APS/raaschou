
import React, { useRef, useEffect } from "react";
import { tableContainerStyles } from "./FokusarkTableStyles";

interface FokusarkTableProps {
  data: string[][];
}

const FokusarkTable: React.FC<FokusarkTableProps> = ({ data }) => {
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const tableVerticalScrollRef = useRef<HTMLDivElement>(null);
  
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
            <table className="min-w-[1600px] table-auto border-collapse divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  {Array.from({ length: 24 }, (_, index) => (
                    <th 
                      key={index} 
                      className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap sticky top-0 bg-background border-b"
                    >
                      Column {index + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-muted/50">
                    {row.map((cell, cellIndex) => (
                      <td 
                        key={cellIndex} 
                        className="px-4 py-3 whitespace-nowrap text-sm"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default FokusarkTable;
