
import React from "react";
import FokusarkTable from "@/components/FokusarkTable";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Calculator, RefreshCw } from "lucide-react";
import { loadFokusarkAppointments, updateAppointmentField } from "@/services/fokusark/appointmentDbService";
import { calculateProjektering, calculateProduktion, calculateMontage, parseNumber } from "@/utils/fokusarkCalculations";
import { getRealizedHours } from "@/utils/appointmentUtils";
import { updateRealizedHours } from "@/api/fokusarkAppointmentsApi";

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
      
      const appointments = await loadFokusarkAppointments();
      
      let updatedCount = 0;
      
      for (const appointment of appointments) {
        const appointmentNumber = appointment.appointment_number;
        
        const rowData = tableData.find(row => row[0] === appointmentNumber);
        
        if (rowData) {
          console.log(`Recalculating values for ${appointmentNumber}`, {
            currentValues: {
              projektering_1: appointment.projektering_1,
              produktion: appointment.produktion,
              montage_3: appointment.montage_3
            },
            rowData
          });
          
          try {
            const projekteringValue = calculateProjektering(rowData);
            const projekteringNumeric = parseNumber(projekteringValue);
            
            console.log(`Recalculating projektering for ${appointmentNumber}:`, {
              calculated: projekteringValue,
              numeric: projekteringNumeric,
              current: appointment.projektering_1
            });
            
            await updateAppointmentField(
              appointmentNumber,
              'projektering_1',
              projekteringNumeric
            );
            
            const updatedRowData = [...rowData];
            updatedRowData[9] = projekteringValue;
            
            const produktionValue = calculateProduktion(updatedRowData);
            const produktionNumeric = parseNumber(produktionValue);
            
            console.log(`Recalculating produktion for ${appointmentNumber}:`, {
              calculated: produktionValue,
              numeric: produktionNumeric,
              current: appointment.produktion
            });
            
            await updateAppointmentField(
              appointmentNumber,
              'produktion',
              produktionNumeric
            );
            
            const montageValue = calculateMontage(updatedRowData);
            const montageNumeric = parseNumber(montageValue);
            
            console.log(`Recalculating montage for ${appointmentNumber}:`, {
              calculated: montageValue,
              numeric: montageNumeric,
              current: appointment.montage_3
            });
            
            await updateAppointmentField(
              appointmentNumber,
              'montage_3',
              montageNumeric
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

  const handleRefreshRealizedHours = async () => {
    try {
      toast({
        title: "Refreshing realized hours",
        description: "Fetching the latest data from the API...",
      });
      
      const appointments = await loadFokusarkAppointments();
      let updatedCount = 0;
      
      for (const appointment of appointments) {
        if (appointment.hn_appointment_id) {
          try {
            const realizedHours = await getRealizedHours(appointment.hn_appointment_id);
            console.log(`Got realized hours for ${appointment.appointment_number}:`, realizedHours);
            
            // Convert the formatted string values back to numbers for storage
            const projekteringNum = parseFloat(realizedHours.projektering.replace('.', '').replace(',', '.')) || 0;
            const produktionNum = parseFloat(realizedHours.produktion.replace('.', '').replace(',', '.')) || 0;
            const montageNum = parseFloat(realizedHours.montage.replace('.', '').replace(',', '.')) || 0;
            const totalNum = parseFloat(realizedHours.total.replace('.', '').replace(',', '.')) || 0;
            
            await updateRealizedHours(
              appointment.appointment_number,
              projekteringNum,
              produktionNum,
              montageNum,
              totalNum
            );
            
            updatedCount++;
          } catch (error) {
            console.error(`Error updating realized hours for ${appointment.appointment_number}:`, error);
          }
        }
      }
      
      toast({
        title: "Refresh complete",
        description: `Updated realized hours for ${updatedCount} appointments.`,
      });
      
      // Reload the page to see the updated data
      window.location.reload();
    } catch (error) {
      console.error("Error refreshing realized hours:", error);
      toast({
        title: "Error refreshing realized hours",
        description: "There was a problem fetching the latest data. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 overflow-y-auto content-wrapper">
      <div className="flex flex-col gap-4 content-wrapper">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold tracking-tight">Fokusark Table</h2>
          <div className="flex gap-2">
            <Button 
              onClick={handleRefreshRealizedHours} 
              className="gap-2"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Realized Hours
            </Button>
            <Button 
              onClick={handleRecalculateValues} 
              className="gap-2"
              variant="outline"
            >
              <Calculator className="h-4 w-4" />
              Recalculate Values
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          This table displays open appointments from e-regnskab with Nr., Subject, and Responsible Person.
          Only showing appointments that are not done and have a Tilbud value greater than 40,000 DKK.
          <br />
          <span className="text-primary font-medium">
            Materialer, Projektering, and Produktion calculations are automatically handled by the system.
            Click "Refresh Realized Hours" to fetch the latest data from the API.
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
