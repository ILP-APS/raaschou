
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { loadFokusarkAppointments } from "@/services/fokusark/appointmentDbService";
import { getRealizedHours } from "@/utils/appointmentUtils";
import { updateRealizedHours } from "@/api/fokusarkAppointmentsApi";

const RefreshRealizedHoursButton: React.FC = () => {
  const { toast } = useToast();
  
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
            console.log(`Fetching realized hours for appointment ${appointment.appointment_number} (ID: ${appointment.hn_appointment_id})`);
            const realizedHours = await getRealizedHours(appointment.hn_appointment_id);
            console.log(`Got realized hours for ${appointment.appointment_number}:`, realizedHours);
            
            // Convert the formatted string values back to numbers for storage
            const projekteringNum = parseFloat(realizedHours.projektering.replace(/\./g, '').replace(',', '.')) || 0;
            const produktionNum = parseFloat(realizedHours.produktion.replace(/\./g, '').replace(',', '.')) || 0;
            const montageNum = parseFloat(realizedHours.montage.replace(/\./g, '').replace(',', '.')) || 0;
            const totalNum = parseFloat(realizedHours.total.replace(/\./g, '').replace(',', '.')) || 0;
            
            console.log(`Parsed values for ${appointment.appointment_number}:`, {
              projektering: projekteringNum,
              produktion_realized: produktionNum, // API value for realized production - renamed for clarity
              montage: montageNum,
              total: totalNum
            });
            
            console.log(`Current appointment data in DB for ${appointment.appointment_number}:`, {
              projektering_1: appointment.projektering_1,
              produktion: appointment.produktion, // estimated/calculated
              produktion_realized: appointment.produktion_realized // realized from API
            });
            
            // Update the realized hours in database - explicitly storing API value in produktion_realized
            await updateRealizedHours(
              appointment.appointment_number,
              projekteringNum,
              produktionNum, // Store API value in produktion_realized column
              montageNum,
              totalNum
            );
            
            console.log(`Successfully updated realized hours for ${appointment.appointment_number}`);
            updatedCount++;
          } catch (error) {
            console.error(`Error updating realized hours for ${appointment.appointment_number}:`, error);
          }
        } else {
          console.log(`Skipping appointment ${appointment.appointment_number} - no hn_appointment_id`);
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
    <Button 
      onClick={handleRefreshRealizedHours} 
      className="gap-2"
      variant="outline"
    >
      <RefreshCw className="h-4 w-4" />
      Refresh Realized Hours
    </Button>
  );
};

export default RefreshRealizedHoursButton;
