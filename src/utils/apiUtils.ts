
// Simplified API utility functions that return empty data
export const fetchOpenAppointments = async () => {
  console.log("API: fetchOpenAppointments called");
  return [];
};

export const sortAndGroupAppointments = (appointments: any[]) => {
  console.log(`API: sortAndGroupAppointments called with ${appointments.length} appointments`);
  return appointments;
};

export const fetchAppointmentDetail = async (appointmentId: number) => {
  console.log(`API: fetchAppointmentDetail called for ID: ${appointmentId}`);
  return null;
};

export const fetchUsers = async () => {
  console.log("API: fetchUsers called");
  return [];
};

export const fetchOfferLineItems = async (offerId: number) => {
  console.log(`API: fetchOfferLineItems called for offer ID: ${offerId}`);
  return [];
};

export const fetchAppointmentLineWork = async (appointmentId: number) => {
  console.log(`API: fetchAppointmentLineWork called for appointment ID: ${appointmentId}`);
  return [];
};
