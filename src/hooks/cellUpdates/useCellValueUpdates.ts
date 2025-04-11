import { useToast } from "@/hooks/use-toast";
import { updateAppointmentField, loadFokusarkAppointments, transformAppointmentsToDisplayData } from "@/services/fokusarkAppointmentService";
import { formatPercentageInput } from "@/utils/fokusarkCalculations";
import { parseNumber } from "@/utils/numberFormatUtils";
import { FokusarkAppointment } from "@/api/fokusarkAppointmentsApi";
import { Dispatch, SetStateAction, useRef } from 'react';
import { useFieldMapping } from "./useFieldMapping";

interface UseCellValueUpdatesProps {
  setAppointments: Dispatch<SetStateAction<FokusarkAppointment[]>>;
  setTableData: Dispatch<SetStateAction<string[][]>>;
}

/**
 * Hook to handle direct cell value updates
 */
export const useCellValueUpdates = ({
  setAppointments,
  setTableData
}: UseCellValueUpdatesProps) => {
  const { toast } = useToast();
  const { getFieldNameForColumn, getColumnDisplayName } = useFieldMapping();
  
  // Debounce mechanism to prevent multiple updates in quick succession
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<{
    appointmentNumber: string;
    colIndex: number;
    value: string;
  } | null>(null);
  
  // Helper function to determine if a column should be treated as percentage
  const isPercentageColumn = (colIndex: number): boolean => {
    return [18, 19].includes(colIndex); 
  };
  
  // Helper function to determine if a column should be treated as currency
  const isCurrencyColumn = (colIndex: number): boolean => {
    return [3, 4, 5, 6, 7, 8, 9, 10, 11].includes(colIndex);
  };
  
  // Updates cell value in the database
  const updateCellValueInDb = async (
    appointmentNumber: string,
    colIndex: number,
    value: string
  ) => {
    // Log the raw input value before any processing
    console.log(`Raw input value for update: "${value}" (appointment: ${appointmentNumber}, column: ${colIndex})`);
    
    // Clean the value - remove DKK suffix if present
    const cleanValue = value.replace(/ DKK$/, '');
    console.log(`Cleaned value for update: "${cleanValue}"`);
    
    // Don't update if nothing changed
    if (
      lastUpdateRef.current && 
      lastUpdateRef.current.appointmentNumber === appointmentNumber &&
      lastUpdateRef.current.colIndex === colIndex &&
      lastUpdateRef.current.value === cleanValue
    ) {
      console.log("No change detected, skipping update");
      return null;
    }
    
    // Update last update reference
    lastUpdateRef.current = {
      appointmentNumber,
      colIndex,
      value: cleanValue
    };
    
    // Clear any existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    console.log(`Processing database update for appointment ${appointmentNumber}, column ${colIndex}, value: ${cleanValue}`);
    
    // Create a promise that will be resolved after the update
    return new Promise<FokusarkAppointment | null>((resolve) => {
      try {
        const fieldName = getFieldNameForColumn(colIndex);
        if (!fieldName) {
          console.error(`Unsupported column index for update: ${colIndex}`);
          resolve(null);
          return;
        }
        
        // For percentage columns, ensure the value is formatted and capped at 100%
        if (isPercentageColumn(colIndex)) {
          value = formatPercentageInput(cleanValue);
        }
        
        // Parse numeric value for database update
        let parsedValue;
        try {
          // For currency columns (including 6, 7), use the parseNumber function
          if (isCurrencyColumn(colIndex)) {
            // First check if the input is a plain number with no separators
            if (/^\d+$/.test(cleanValue)) {
              parsedValue = parseInt(cleanValue, 10);
              console.log(`Parsed plain number: ${cleanValue} -> ${parsedValue}`);
            } else {
              // Otherwise use the parseNumber function for formatted input
              parsedValue = parseNumber(cleanValue);
              console.log(`Parsed formatted number: ${cleanValue} -> ${parsedValue}`);
            }
          } else {
            // For other numeric values, attempt basic parsing
            parsedValue = parseFloat(cleanValue.replace(/\./g, '').replace(',', '.'));
            console.log(`Parsed non-currency value: ${cleanValue} -> ${parsedValue}`);
          }
          
          if (isNaN(parsedValue)) {
            console.log(`Value parsed as NaN, defaulting to 0: "${cleanValue}"`);
            parsedValue = 0;
          }
        } catch (e) {
          console.error(`Error parsing value "${cleanValue}" for column ${colIndex}:`, e);
          parsedValue = 0;
        }
        
        console.log(`Sending to database: ${fieldName} for appointment ${appointmentNumber} = ${parsedValue}`);
        
        // Process the update
        updateAppointmentField(appointmentNumber, fieldName, parsedValue)
          .then(updatedAppointment => {
            console.log(`Database update successful: ${fieldName} = ${parsedValue} for ${appointmentNumber}`);
            
            // Update appointments state with updated appointment
            setAppointments(prev => 
              prev.map(app => 
                app.appointment_number === appointmentNumber ? updatedAppointment : app
              )
            );
            
            toast({
              title: "Updated successfully",
              description: `Updated ${getColumnDisplayName(colIndex)} for ${appointmentNumber}`,
            });
            
            resolve(updatedAppointment);
          })
          .catch(error => {
            console.error(`Error updating ${appointmentNumber}:`, error);
            toast({
              title: "Error saving data",
              description: "Could not save your changes to the database. Please try again.",
              variant: "destructive",
            });
            
            try {
              // Only reload if we have a serious error
              loadFokusarkAppointments()
                .then(reloadedAppointments => {
                  setAppointments(reloadedAppointments);
                  setTableData(transformAppointmentsToDisplayData(reloadedAppointments));
                })
                .catch(reloadError => {
                  console.error('Error reloading data after failed update:', reloadError);
                });
            } catch (reloadError) {
              console.error('Error reloading data after failed update:', reloadError);
            }
            
            resolve(null);
          });
      } catch (error) {
        console.error(`Error processing update for ${appointmentNumber}:`, error);
        resolve(null);
      }
    });
  };
  
  return { 
    updateCellValueInDb, 
    isPercentageColumn,
    isCurrencyColumn
  };
};
