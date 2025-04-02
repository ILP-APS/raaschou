
// API utility for e-regnskab data fetching
export const fetchOpenAppointments = async () => {
  const res = await fetch(
    "https://publicapi.e-regnskab.dk/Appointment/Standard/Address?open=true",
    {
      method: "GET",
      headers: {
        "accept": "application/json",
        "ApiKey": "w9Jq5NiTeOIpXfovZ0Hf1jLnM:pGwZ"
      }
    }
  );
  
  if (!res.ok) throw new Error("Failed to fetch open appointments");
  return res.json();
};

// Fetch appointment details by ID
export const fetchAppointmentDetail = async (appointmentId: number) => {
  const res = await fetch(
    `https://publicapi.e-regnskab.dk/Appointment/Standard/${appointmentId}`,
    {
      method: "GET",
      headers: {
        "accept": "application/json",
        "ApiKey": "w9Jq5NiTeOIpXfovZ0Hf1jLnM:pGwZ"
      }
    }
  );
  
  if (!res.ok) throw new Error(`Failed to fetch appointment details for ID: ${appointmentId}`);
  return res.json();
};

// Helper function to sort appointments by ID and group sub-appointments
export const sortAndGroupAppointments = (appointments: any[]) => {
  // Create a mapping of parent appointment numbers to arrays of sub-appointments
  const appointmentGroups: Record<string, any[]> = {};
  
  // First, separate parent appointments and sub-appointments
  appointments.forEach(appointment => {
    const appNumber = appointment.appointmentNumber;
    
    // Check if this is a sub-appointment (contains a hyphen)
    if (appNumber && appNumber.includes('-')) {
      // Extract the parent appointment number (everything before the hyphen)
      const parentNumber = appNumber.split('-')[0];
      
      // Initialize the group array if it doesn't exist
      if (!appointmentGroups[parentNumber]) {
        appointmentGroups[parentNumber] = [];
      }
      
      // Add this appointment to its parent group
      appointmentGroups[parentNumber].push(appointment);
    } else {
      // This is a parent appointment or standalone appointment
      // Initialize its group with just itself
      if (!appointmentGroups[appNumber]) {
        appointmentGroups[appNumber] = [];
      }
      
      // Add the parent appointment as the first in its group
      appointmentGroups[appNumber].unshift(appointment);
    }
  });
  
  // Now, flatten the groups into a single sorted array
  const sortedAppointments: any[] = [];
  
  // Sort the parent appointment numbers numerically
  const sortedParentNumbers = Object.keys(appointmentGroups).sort((a, b) => {
    return parseInt(a) - parseInt(b);
  });
  
  // For each parent, add it and then its sub-appointments
  sortedParentNumbers.forEach(parentNumber => {
    const group = appointmentGroups[parentNumber];
    
    // Add all appointments in this group
    sortedAppointments.push(...group);
  });
  
  return sortedAppointments;
};
