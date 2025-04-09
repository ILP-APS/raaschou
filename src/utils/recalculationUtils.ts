
import { formatDanishNumber, parseNumber } from "@/utils/numberFormatUtils";
import { 
  calculateProjektering, 
  calculateProduktion, 
  calculateMontage, 
  calculateTimerTilbage, 
  calculateProduktionTimerTilbage, 
  calculateTotal 
} from "@/utils/fokusarkCalculations";
import { updateAppointmentField } from "@/services/fokusarkAppointmentService";
import { FokusarkAppointment } from "@/api/fokusarkAppointmentsApi";

/**
 * Performs all recalculations for a single appointment
 */
export async function recalculateAppointmentValues(
  appointment: FokusarkAppointment,
  rowData: string[]
): Promise<number> {
  const appointmentNumber = appointment.appointment_number;
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
    // Create a mutable copy of the row data we can update as we go
    const updatedRowData = [...rowData];
    
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
    updatedRowData[13] = formatDanishNumber(appointment.produktion_realized || 0);
    
    // Special debug for appointment 24258
    if (appointmentNumber === '24258') {
      console.log(`[CRITICAL DEBUG] Produktion timer tilbage calculation for 24258:`, {
        estimatedProduktion: produktionNumeric,
        realizedProduktion: appointment.produktion_realized,
        row10: updatedRowData[10],
        row13: updatedRowData[13]
      });
    }
    
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
    
    await updateAppointmentField(
      appointmentNumber,
      'timer_tilbage_2',
      produktionTimerTilbageNumeric
    );
    
    return 1; // Successfully updated
  } catch (error) {
    console.error(`Error recalculating values for ${appointmentNumber}:`, error);
    return 0; // Failed to update
  }
}
