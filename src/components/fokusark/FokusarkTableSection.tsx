
import React from "react";
import FokusarkDataGrid from "./FokusarkDataGrid";
import { useFokusarkTable } from "@/hooks/useFokusarkTable";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FokusarkTableSectionProps {
  tableData: string[][];
  isLoading: boolean;
}

const FokusarkTableSection: React.FC<FokusarkTableSectionProps> = ({ 
  tableData, 
  isLoading 
}) => {
  const { handleCellChange, handleCellBlur } = useFokusarkTable(tableData);
  
  // Debug function to check data in Supabase
  const checkSupabaseData = async () => {
    try {
      const { data, error } = await supabase
        .from('fokusark_table')
        .select('*')
        .limit(5);
        
      if (error) {
        console.error("Error fetching Supabase data:", error);
        toast.error("Error checking Supabase data");
        return;
      }
      
      console.log("Sample data from Supabase:", data);
      toast.success("Check console for Supabase data sample");
    } catch (err) {
      console.error("Exception checking Supabase data:", err);
      toast.error("Exception checking Supabase data");
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="fokusark-table-container">
      <div className="mb-3 flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkSupabaseData}
          className="flex items-center space-x-1"
        >
          <Database className="h-4 w-4 mr-1" />
          <span>Debug Supabase Data</span>
        </Button>
      </div>
      <FokusarkDataGrid 
        data={tableData}
        onCellChange={handleCellChange}
        onCellBlur={handleCellBlur}
      />
    </div>
  );
};

export default FokusarkTableSection;
