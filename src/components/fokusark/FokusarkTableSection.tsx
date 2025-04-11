
import React from "react";
import FokusarkDataGrid from "./FokusarkDataGrid";
import { useFokusarkTable } from "@/hooks/useFokusarkTable";
import { Button } from "@/components/ui/button";
import { Database, Search } from "lucide-react";
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
  
  // Debug function to check data in Supabase for specific appointment
  const checkAppointmentData = async (appointmentNumber?: string) => {
    try {
      let query = supabase
        .from('fokusark_table')
        .select('*');
        
      if (appointmentNumber) {
        query = query.eq('1 col', appointmentNumber);
      } else {
        query = query.limit(5);
      }
      
      const { data, error } = await query;
        
      if (error) {
        console.error("Error fetching Supabase data:", error);
        toast.error("Error checking Supabase data");
        return;
      }
      
      console.log("Data from Supabase:", data);
      
      if (data && data.length > 0) {
        // Specifically show montage2 (7 col) and underleverandor2 (8 col) values
        data.forEach(row => {
          console.log(`Appointment ${row['1 col']} | Montage2: ${row['7 col']} | Underleverandor2: ${row['8 col']}`);
        });
        toast.success(`Found ${data.length} row(s). Check console for details.`);
      } else {
        toast.warning("No matching data found in Supabase");
      }
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
      <div className="mb-3 flex justify-end gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => checkAppointmentData('25131')}
          className="flex items-center space-x-1"
        >
          <Search className="h-4 w-4 mr-1" />
          <span>Check Row 25131</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => checkAppointmentData()}
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
