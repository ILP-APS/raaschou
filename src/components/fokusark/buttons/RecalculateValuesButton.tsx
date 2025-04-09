
import React from "react";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { loadFokusarkAppointments, updateAppointmentField } from "@/services/fokusarkAppointmentService";
import { calculateProjektering, calculateProduktion, calculateMontage, calculateTimerTilbage, calculateProduktionTimerTilbage, parseNumber, calculateTotal, formatDanishNumber } from "@/utils/fokusarkCalculations";

interface RecalculateValuesButtonProps {
  tableData: string[][];
}

const RecalculateValuesButton: React.FC<RecalculateValuesButtonProps> = ({ tableData }) => {
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
        
        const rowData = tableData.find(row => row[0] === appointmentNumber.toString());
        
        if (rowData) {
          console.log(`Recalculating values for ${appointmentNumber}`, {
            currentValues: {
              projektering_1: appointment.projektering_1,
              produktion: appointment.produktion, // estimated/calculated
              produktion_realized: appointment.produktion_realized, // from API
              montage_3: appointment.montage_3,
              projektering_2: appointment.projektering_2,
              timer_tilbage_1: appointment.timer_tilbage_1,
              timer_tilbage_2: appointment.timer_tilbage_2
            },
            rowData
          });
          
          try {
            // Calculate projektering
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
            
            // Calculate produktion (estimated)
            const produktionValue = calculateProduktion(updatedRowData);
            const produktionNumeric = parseNumber(produktionValue);
            
            console.log(`Recalculating estimated produktion for ${appointmentNumber}:`, {
              calculated: produktionValue,
              numeric: produktionNumeric,
              current: appointment.produktion
            });
            
            if (appointmentNumber === '24258') {
              console.log(`[CRITICAL DEBUG] Saving estimated produktion for 24258:`, {
                value: produktionNumeric,
                formatted: produktionValue
              });
            }
            
            await updateAppointmentField(
              appointmentNumber,
              'produktion',
              produktionNumeric
            );
            
            updatedRowData[10] = produktionValue;
            
            // Calculate montage
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
            
            updatedRowData[11] = montageValue;
            
            // Calculate total
            const totalValue = calculateTotal(updatedRowData);
            const totalNumeric = parseNumber(totalValue);
            
            console.log(`Recalculating total for ${appointmentNumber}:`, {
              calculated: totalValue,
              numeric: totalNumeric,
              current: appointment.total
            });
            
            await updateAppointmentField(
              appointmentNumber,
              'total',
              totalNumeric
            );
            
            // Calculate projektering timer tilbage
            // Ensure we have the realized projektering value at position 12
            updatedRowData[12] = formatDanishNumber(appointment.projektering_2 || 0);
            
            const timerTilbageValue = calculateTimerTilbage(updatedRowData);
            const timerTilbageNumericValue = parseNumber(timerTilbageValue);
            
            console.log(`Recalculating timer tilbage for ${appointmentNumber}:`, {
              calculated: timerTilbageValue,
              numeric: timerTilbageNumericValue,
              current: appointment.timer_tilbage_1,
              projektering_1: projekteringNumeric,
              projektering_2: appointment.projektering_2
            });
            
            await updateAppointmentField(
              appointmentNumber,
              'timer_tilbage_1',
              timerTilbageNumericValue
            );
            
            // Calculate produktion timer tilbage 
            // Make sure we have the realized produktion value at position 13 (from API)
            updatedRowData[13] = formatDanishNumber(appointment.produktion_realized || 0);
            
            // Check the values for appointment 24258
            if (appointmentNumber === '24258') {
              console.log(`[CRITICAL DEBUG] Produktion timer tilbage calculation for 24258:`, {
                estimatedProduktion: produktionNumeric,
                realizedProduktion: appointment.produktion_realized,
                row10: updatedRowData[10],
                row13: updatedRowData[13]
              });
            }
            
            // Now calculate produktion timer tilbage
            const produktionTimerTilbageValue = calculateProduktionTimerTilbage(updatedRowData);
            const produktionTimerTilbageNumeric = parseNumber(produktionTimerTilbageValue);
            
            console.log(`Recalculating produktion timer tilbage for ${appointmentNumber}:`, {
              calculated: produktionTimerTilbageValue,
              numeric: produktionTimerTilbageNumeric,
              current: appointment.timer_tilbage_2,
              produktion: produktionNumeric,
              realized_produktion: appointment.produktion_realized, 
              difference: produktionNumeric - (appointment.produktion_realized || 0)
            });
            
            // Update timer_tilbage_2 in the database
            await updateAppointmentField(
              appointmentNumber,
              'timer_tilbage_2',
              produktionTimerTilbageNumeric
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

  return (
    <Button 
      onClick={handleRecalculateValues} 
      className="gap-2"
      variant="outline"
    >
      <Calculator className="h-4 w-4" />
      Recalculate Values
    </Button>
  );
};

export default RecalculateValuesButton;
