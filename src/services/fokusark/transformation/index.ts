
// Main entry point for transformation utilities

// Re-export the API-to-model transformation
export { transformApiDataToAppointments } from "./apiToModel";

// Re-export the model-to-display transformation
export { transformAppointmentsToDisplayData } from "./modelToDisplay";

// Export individual transformation helpers for testing or direct usage
export { addCoreAppointmentData } from "./coreDisplayData";
export { addEstimatedValues } from "./estimatedValues";
export { addRealizedValues } from "./realizedValues";
export { addRemainingColumns } from "./remainingColumns";
export { formatValueOrEmpty, isValidNumericValue } from "./helpers";

