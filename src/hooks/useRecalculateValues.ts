
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { loadFokusarkAppointments } from "@/services/fokusarkAppointmentService";
import { recalculateAppointmentValues } from "@/utils/recalculationUtils";

export function useRecalculateValues() {
  const [isRecalculating, setIsRecalculating] = useState(false);
  const { toast } = useToast();

  const recalculateValues = async (tableData: string[][]) => {
    if (isRecalculating) return;
    
    try {
      setIsRecalculating(true);
      toast({
        title: "Recalculating values",
        description: "Please wait while we update the calculations...",
      });
      
      const appointments = await loadFokusarkAppointments();
      
      let updatedCount = 0;
      
      for (const appointment of appointments) {
        const appointmentNumber = appointment.appointment_number;
        const rowData = tableData.find(row => row[0] === appointmentNumber.toString());
        
        if (rowData) {
          // Use the utility function to recalculate values
          const result = await recalculateAppointmentValues(appointment, rowData);
          if (result > 0) {
            updatedCount += result;
          }
        }
      }
      
      toast({
        title: "Recalculation complete",
        description: `Updated ${updatedCount} appointments with new calculated values.`,
      });
      
      // Refresh the page to show updated values
      window.location.reload();
    } catch (error) {
      console.error("Error recalculating values:", error);
      toast({
        title: "Error updating calculations",
        description: "There was a problem updating the calculated values. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRecalculating(false);
    }
  };

  return {
    recalculateValues,
    isRecalculating
  };
}
