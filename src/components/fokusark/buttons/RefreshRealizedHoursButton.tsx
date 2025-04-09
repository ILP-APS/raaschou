
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { loadFokusarkAppointments } from "@/services/fokusark/appointmentDbService";
import { fetchAppointmentLineWork } from "@/utils/apiUtils";
import { calculateRealizedHours } from "@/utils/workTypeMapping";
import { updateRealizedHours } from "@/api/fokusarkAppointmentsApi";
import { formatDanishNumber } from "@/utils/formatUtils";

const RefreshRealizedHoursButton: React.FC = () => {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefreshRealizedHours = async () => {
    if (isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      
      toast({
        title: "Refreshing realized hours",
        description: "Fetching the latest data from the API...",
      });
      
      const appointments = await loadFokusarkAppointments();
      let updatedCount = 0;
      let errorCount = 0;
      
      for (const appointment of appointments) {
        if (appointment.hn_appointment_id) {
          try {
            console.log(`Fetching realized hours for appointment ${appointment.appointment_number} (ID: ${appointment.hn_appointment_id})`);
            
            // Fetch appointment line work data directly from API
            const lineWorkData = await fetchAppointmentLineWork(appointment.hn_appointment_id);
            
            // Use the mapping function to categorize and calculate hours
            const realizedHours = calculateRealizedHours(lineWorkData);
            
            console.log(`Calculated realized hours for ${appointment.appointment_number}:`, realizedHours);
            
            // Special debug for appointment 24375
            if (appointment.appointment_number === '24375') {
              console.log(`[SPECIAL DEBUG] Appointment 24375 realized hours:`, {
                lineWorkDataCount: lineWorkData.length,
                calculatedHours: realizedHours
              });
            }
            
            // Format the hours for display
            const formattedHours = {
              projektering: formatDanishNumber(realizedHours.projektering),
              produktion: formatDanishNumber(realizedHours.produktion),
              montage: formatDanishNumber(realizedHours.montage),
              total: formatDanishNumber(realizedHours.total)
            };
            
            console.log(`Formatted realized hours for ${appointment.appointment_number}:`, formattedHours);
            
            // Update the realized hours in database - explicitly storing API raw values
            await updateRealizedHours(
              appointment.appointment_number,
              realizedHours.projektering,
              realizedHours.produktion, 
              realizedHours.montage,
              realizedHours.total
            );
            
            console.log(`Successfully updated realized hours for ${appointment.appointment_number}`);
            updatedCount++;
          } catch (error) {
            console.error(`Error updating realized hours for ${appointment.appointment_number}:`, error);
            errorCount++;
          }
        } else {
          console.log(`Skipping appointment ${appointment.appointment_number} - no hn_appointment_id`);
        }
      }
      
      toast({
        title: "Refresh complete",
        description: `Updated realized hours for ${updatedCount} appointments. Errors: ${errorCount}`,
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
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button 
      onClick={handleRefreshRealizedHours} 
      className="gap-2"
      variant="outline"
      disabled={isRefreshing}
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Refreshing...' : 'Refresh Realized Hours'}
    </Button>
  );
};

export default RefreshRealizedHoursButton;
