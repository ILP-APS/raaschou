import React, { useRef, useEffect, useState } from "react";
import FokusarkTableHeader from "./FokusarkTableHeader";
import FokusarkTableBody from "./FokusarkTableBody";
import { tableContainerStyles } from "./FokusarkTableStyles";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FokusarkCellData } from "@/api/fokusarkApi";

interface FokusarkTableProps {
  data: string[][];
}

const FokusarkTable: React.FC<FokusarkTableProps> = ({ data }) => {
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const tableVerticalScrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Create a state copy of the data to allow for editing
  const [tableData, setTableData] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load data and saved values from Supabase when component mounts
  useEffect(() => {
    async function fetchSavedData() {
      if (!data.length) return;
      
      // Get fresh copy of data
      const initialData = [...data];
      
      try {
        setIsLoading(true);
        // Fetch saved values from Supabase
        const { data: savedCells, error } = await supabase
          .from('fokusark_cells')
          .select('*') as unknown as {
            data: FokusarkCellData[] | null;
            error: Error | null;
          };
        
        if (error) {
          throw error;
        }
        
        if (savedCells && savedCells.length > 0) {
          // Apply saved values to the data
          savedCells.forEach((cell: FokusarkCellData) => {
            const { row_index, col_index, value } = cell;
            if (row_index < initialData.length) {
              // Create a copy of the row if it exists
              const rowCopy = [...initialData[row_index]];
              rowCopy[col_index] = value;
              initialData[row_index] = rowCopy;
            }
          });
        }
        
        setTableData(initialData);
      } catch (error) {
        console.error('Error loading saved cell data:', error);
        toast({
          title: "Error loading data",
          description: "Could not load saved data. Using default values.",
          variant: "destructive",
        });
        setTableData(data);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchSavedData();
  }, [data, toast]);
  
  // Handle cell value changes
  const handleCellChange = async (rowIndex: number, colIndex: number, value: string) => {
    setTableData(prevData => {
      const newData = [...prevData];
      
      // Create a copy of the row
      const rowCopy = [...newData[rowIndex]];
      
      // Update the specific cell
      rowCopy[colIndex] = value;
      
      // Update the row in the data
      newData[rowIndex] = rowCopy;
      
      return newData;
    });
    
    // Save to Supabase
    try {
      // Check if a record already exists for this cell
      const { data: existingData, error: fetchError } = await supabase
        .from('fokusark_cells')
        .select('*')
        .eq('row_index', rowIndex)
        .eq('col_index', colIndex) as unknown as {
          data: FokusarkCellData[] | null;
          error: Error | null;
        };
      
      if (fetchError) throw fetchError;
      
      let result;
      
      if (existingData && existingData.length > 0) {
        // Update existing record
        result = await supabase
          .from('fokusark_cells')
          .update({ value })
          .eq('row_index', rowIndex)
          .eq('col_index', colIndex) as unknown as {
            error: Error | null;
          };
      } else {
        // Insert new record
        result = await supabase
          .from('fokusark_cells')
          .insert([{ row_index: rowIndex, col_index: colIndex, value }]) as unknown as {
            error: Error | null;
          };
      }
      
      if (result.error) throw result.error;
      
      // Show a toast notification
      const columnName = colIndex === 6 ? "Montage 2" : "Underleverandør 2";
      toast({
        title: "Cell updated",
        description: `Updated ${columnName} value for row ${rowIndex + 1}`,
      });
    } catch (error) {
      console.error('Error saving cell data:', error);
      toast({
        title: "Error saving data",
        description: "Could not save your changes to the database. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Determine the number of columns based on the first row of data
  const columnCount = tableData.length > 0 ? tableData[0].length : 0;
  
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

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="rounded-md border w-full overflow-hidden main-content flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading saved data...</p>
        </div>
      </div>
    );
  }

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
            <table className="table-auto border-collapse divide-y divide-border">
              <FokusarkTableHeader columnCount={columnCount} />
              <FokusarkTableBody 
                data={tableData} 
                onCellChange={handleCellChange}
              />
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default FokusarkTable;
