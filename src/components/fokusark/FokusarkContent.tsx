
import React from "react";
import FokusarkTable from "@/components/FokusarkTable";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Calculator } from "lucide-react";
import { loadFokusarkAppointments, updateAppointmentField } from "@/services/fokusarkAppointmentService";
import { calculateProjektering, calculateProduktion, parseNumber } from "@/utils/fokusarkCalculations";

interface FokusarkContentProps {
  tableData: string[][];
  isLoading: boolean;
}

const FokusarkContent: React.FC<FokusarkContentProps> = ({ tableData, isLoading }) => {
  const { toast } = useToast();
  
  const handleRecalculateValues = async () => {
    try {
      toast({
        title: "Recalculating values",
        description: "Please wait while we update the calculations...",
      });
      
      // Load the current data
      const appointments = await loadFokusarkAppointments();
      
      // Counter for updated values
      let updatedCount = 0;
      
      // Process each appointment
      for (const appointment of appointments) {
        const appointmentNumber = appointment.appointment_number;
        
        // Find the corresponding row in tableData
        const rowData = tableData.find(row => row[0] === appointmentNumber);
        
        if (rowData) {
          console.log(`Recalculating values for ${appointmentNumber}`, {
            currentValues: {
              projektering_1: appointment.projektering_1,
              produktion: appointment.produktion
            },
            rowData
          });
          
          try {
            // Calculate projektering value
            const projekteringValue = calculateProjektering(rowData);
            const projekteringNumeric = parseNumber(projekteringValue);
            
            console.log(`Recalculating projektering for ${appointmentNumber}:`, {
              calculated: projekteringValue,
              numeric: projekteringNumeric,
              current: appointment.projektering_1
            });
            
            // Force update projektering
            await updateAppointmentField(
              appointmentNumber,
              'projektering_1',
              projekteringNumeric
            );
            
            // After updating projektering, recalculate produktion which depends on it
            // Get the updated row data with new projektering value
            const updatedRowData = [...rowData];
            updatedRowData[9] = projekteringValue;
            
            // Calculate produktion value
            const produktionValue = calculateProduktion(updatedRowData);
            const produktionNumeric = parseNumber(produktionValue);
            
            console.log(`Recalculating produktion for ${appointmentNumber}:`, {
              calculated: produktionValue,
              numeric: produktionNumeric,
              current: appointment.produktion
            });
            
            // Force update produktion
            await updateAppointmentField(
              appointmentNumber,
              'produktion',
              produktionNumeric
            );
            
            updatedCount++;
          } catch (error) {
            console.error(`Error recalculating values for ${appointmentNumber}:`, error);
          }
        }
      }
      
      toast({
        title: "Recalculation complete",
        description: `Updated ${updatedCount} appointments with new calculated values.`,
      });
      
      // Force a page reload to show the new values
      window.location.reload();
    } catch (error) {
      console.error("Error recalculating values:", error);
      toast({
        title: "Error updating calculations",
        description: "There was a problem updating the calculated values. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 overflow-y-auto content-wrapper">
      <div className="flex flex-col gap-4 content-wrapper">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold tracking-tight">Fokusark Table</h2>
          <Button 
            onClick={handleRecalculateValues} 
            className="gap-2"
            variant="outline"
          >
            <Calculator className="h-4 w-4" />
            Recalculate Values
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          This table displays open appointments from e-regnskab with Nr., Subject, and Responsible Person.
          Only showing appointments that are not done and have a Tilbud value greater than 40,000 DKK.
          <br />
          <span className="text-primary font-medium">
            Materialer, Projektering, and Produktion calculations are automatically handled by the system.
          </span>
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <FokusarkTable data={tableData} />
      )}
    </div>
  );
};

export default FokusarkContent;
