// Mock utility functions (no real API calls)
export const fetchOpenAppointments = async () => {
  console.log("Mock: fetchOpenAppointments called - would normally call API");
  
  // This function is now handled by mock data in useAppointments.ts
  // Return an empty array as we're not using this data anymore
  return [];
};

// Simplified sortAndGroupAppointments function (not used anymore, but kept for compatibility)
export const sortAndGroupAppointments = (appointments: any[]) => {
  console.log(`Mock: sortAndGroupAppointments called with ${appointments.length} appointments`);
  
  // Just return the appointments as is, since we're using mock data
  return appointments;
};

// Other API utility functions (kept but simplified to avoid errors)
export const fetchAppointmentDetail = async (appointmentId: number) => {
  console.log(`Mock: fetchAppointmentDetail called for ID: ${appointmentId}`);
  
  // Return mock data
  return {
    hnAppointmentID: appointmentId,
    appointmentNumber: appointmentId.toString(),
    subject: `Mock Appointment ${appointmentId}`,
    responsibleHnUserID: 42,
    description: "Mock appointment description",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000).toISOString(),
    done: false
  };
};

export const fetchUsers = async () => {
  console.log("Mock: fetchUsers called - would normally call API");
  
  // This function is now handled by mock data in useUsers.ts
  // Return an empty array as we're not using this data anymore
  return [];
};

export const fetchOfferLineItems = async (offerId: number) => {
  console.log(`Mock: fetchOfferLineItems called for offer ID: ${offerId}`);
  
  // Return mock data
  return {
    offerTotal: "125000.00",
    montageTotal: "25000.00",
    underleverandorTotal: "10000.00"
  };
};

export const fetchAppointmentLineWork = async (appointmentId: number) => {
  console.log(`Mock: fetchAppointmentLineWork called for appointment ID: ${appointmentId}`);
  
  // Return mock data (empty array)
  return [];
};
