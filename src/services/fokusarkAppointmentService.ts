
/**
 * Main service module for Fokusark appointments
 * Acts as a facade for the smaller specialized modules
 */

// Re-export transformation utilities
export { 
  transformApiDataToAppointments,
  transformAppointmentsToDisplayData 
} from "./fokusark/transformation";

// Re-export database operations
export { 
  loadFokusarkAppointments,
  updateAppointmentField,
  saveAppointmentBatch
} from "./fokusark/appointmentDbService";

// Re-export initialization service
export {
  saveApiDataToSupabase
} from "./fokusark/appointmentInitService";

// Re-export the formatting utility that was previously in this file
// but now moved to utils/formatUtils.ts
export { formatDanishNumber } from "@/utils/formatUtils";

