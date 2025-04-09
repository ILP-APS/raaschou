
import React, { useEffect } from "react";
import FokusarkTable from "@/components/FokusarkTable";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Calculator } from "lucide-react";
import { loadFokusarkAppointments, updateAppointmentField } from "@/services/fokusarkAppointmentService";
import { calculateProjektering, parseNumber } from "@/utils/fokusarkCalculations";

interface FokusarkContentProps {
  tableData: string[][];
  isLoading: boolean;
}

const FokusarkContent: React.FC<FokusarkContentProps> = ({ tableData, isLoading }) => {
  const { toast } = useToast();
  
  // Debug function to check specific calculation
  useEffect(() => {
    if (tableData.length > 0) {
      // Find appointment 24371
      const targetAppointment = tableData.find(row => row[0] === '24371');
      if (targetAppointment) {
        console.log("Found target appointment 24371:", targetAppointment);
        // Manually calculate
        const tilbud = parseNumber(targetAppointment[3]);
        const montage = parseNumber(targetAppointment[4]);
        const montage2 = parseNumber(targetAppointment[6]);
        
        const montageValue = montage2 > 0 ? montage2 : montage;
        console.log("24371 Calculation values:", { tilbud, montage, montage2, montageValue });
        
        const step1 = tilbud - montageValue;
        const step2 = step1 * 0.10;
        const projektering = step2 / 830;
        
        console.log("24371 Manual calculation:", {
          step1_tilbud_minus_montage: step1,
          step2_multiply_by_010: step2,
          step3_divide_by_830: projektering,
          formatted: projektering.toLocaleString('da-DK', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })
        });
        
        // Calculate using the official function
        const officialResult = calculateProjektering(targetAppointment);
        console.log("24371 Official calculation result:", officialResult);
      }
    }
  }, [tableData]);
  
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
          // Calculate projektering value
          const projekteringValue = calculateProjektering(rowData);
          const projekteringNumeric = parseNumber(projekteringValue);
          
          // Update if the value changed
          if (projekteringNumeric > 0 && projekteringNumeric !== appointment.projektering_1) {
            await updateAppointmentField(
              appointmentNumber,
              'projektering_1',
              projekteringNumeric
            );
            updatedCount++;
          }
        }
      }
      
      toast({
        title: "Recalculation complete",
        description: `Updated ${updatedCount} appointments with new calculated values.`,
      });
      
      // Force a page reload to show the new values
      if (updatedCount > 0) {
        window.location.reload();
      }
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
            Materialer and Projektering calculations are automatically handled by the system.
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
