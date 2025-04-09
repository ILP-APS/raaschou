
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
  const [progress, setProgress] = useState(0);
  
  const handleRefreshRealizedHours = async () => {
    if (isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      setProgress(0);
      
      toast({
        title: "Refreshing realized hours",
        description: "Fetching the latest data from the API...",
      });
      
      const appointments = await loadFokusarkAppointments();
      let updatedCount = 0;
      let errorCount = 0;
      const totalAppointments = appointments.length;
      
      // Process appointments in batches of 5 to avoid overwhelming the API
      const batchSize = 5;
      const batches = [];
      
      for (let i = 0; i < appointments.length; i += batchSize) {
        batches.push(appointments.slice(i, i + batchSize));
      }
      
      for (const [batchIndex, batch] of batches.entries()) {
        // Process each batch in parallel
        const batchPromises = batch.map(async (appointment) => {
          if (appointment.hn_appointment_id) {
            try {
              console.log(`Fetching realized hours for appointment ${appointment.appointment_number} (ID: ${appointment.hn_appointment_id})`);
              
              // Fetch appointment line work data directly from API
              const lineWorkData = await fetchAppointmentLineWork(appointment.hn_appointment_id);
              
              // Use the mapping function to categorize and calculate hours
              const realizedHours = calculateRealizedHours(lineWorkData);
              
              console.log(`Calculated realized hours for ${appointment.appointment_number}:`, realizedHours);
              
              // Special debug for appointment 24375
              if (appointment.hn_appointment_id === 24375) {
                console.log(`[SPECIAL DEBUG] Appointment 24375 realized hours:`, {
                  lineWorkDataCount: lineWorkData.length,
                  calculatedHours: realizedHours
                });
              }
              
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
              return { success: true };
            } catch (error) {
              console.error(`Error updating realized hours for ${appointment.appointment_number}:`, error);
              errorCount++;
              return { success: false };
            }
          } else {
            console.log(`Skipping appointment ${appointment.appointment_number} - no hn_appointment_id`);
            return { success: false };
          }
        });
        
        // Wait for all promises in this batch to complete
        await Promise.all(batchPromises);
        
        // Update progress after each batch
        const completedBatches = batchIndex + 1;
        const newProgress = Math.round((completedBatches * batchSize / totalAppointments) * 100);
        setProgress(Math.min(newProgress, 99)); // Cap at 99% until fully complete
        
        // Show progress toast
        toast({
          title: "Refresh in progress",
          description: `Processed ${Math.min((batchIndex + 1) * batchSize, totalAppointments)} of ${totalAppointments} appointments...`,
        });
      }
      
      setProgress(100);
      
      toast({
        title: "Refresh complete",
        description: `Updated realized hours for ${updatedCount} appointments. Errors: ${errorCount}`,
      });
      
      // Allow state to update rather than reloading the page
      // Force a re-render of the component tree by updating a global state
      // This is handled by the parent component that will receive the updated data
    } catch (error) {
      console.error("Error refreshing realized hours:", error);
      toast({
        title: "Error refreshing realized hours",
        description: "There was a problem fetching the latest data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
      setProgress(0);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <Button 
        onClick={handleRefreshRealizedHours} 
        className="gap-2"
        variant="outline"
        disabled={isRefreshing}
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Refreshing...' : 'Refresh Realized Hours'}
      </Button>
      {isRefreshing && (
        <div className="w-full bg-muted rounded-full h-1.5 mt-1">
          <div 
            className="bg-primary h-1.5 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default RefreshRealizedHoursButton;
