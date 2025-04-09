
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

// New function to fetch all users
export const fetchUsers = async () => {
  const res = await fetch(
    "https://publicapi.e-regnskab.dk/User?includeHidden=false",
    {
      method: "GET",
      headers: {
        "accept": "application/json",
        "ApiKey": "w9Jq5NiTeOIpXfovZ0Hf1jLnM:pGwZ"
      }
    }
  );
  
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
};

// New function to fetch offer line items by offer ID
export const fetchOfferLineItems = async (offerId: number) => {
  const res = await fetch(
    `https://publicapi.e-regnskab.dk/Offer/Standard/Line/Item?hnOfferID=${offerId}`,
    {
      method: "GET",
      headers: {
        "accept": "application/json",
        "ApiKey": "w9Jq5NiTeOIpXfovZ0Hf1jLnM:pGwZ"
      }
    }
  );
  
  if (!res.ok) throw new Error(`Failed to fetch offer line items for offer ID: ${offerId}`);
  return res.json();
};

// Function to fetch appointment line work data
export const fetchAppointmentLineWork = async (appointmentId: number) => {
  console.log(`Fetching line work data for appointment ID: ${appointmentId}`);
  const res = await fetch(
    `https://publicapi.e-regnskab.dk/Appointment/Standard/Line/Work?hnAppointmentID=${appointmentId}`,
    {
      method: "GET",
      headers: {
        "accept": "application/json",
        "ApiKey": "w9Jq5NiTeOIpXfovZ0Hf1jLnM:pGwZ"
      }
    }
  );
  
  if (!res.ok) {
    console.error(`Failed to fetch line work data for appointment ID: ${appointmentId}`, {
      status: res.status,
      statusText: res.statusText
    });
    throw new Error(`Failed to fetch line work for appointment ID: ${appointmentId}`);
  }
  
  const data = await res.json();
  
  // Add special logging for appointment 24375
  if (appointmentId === 24375) {
    console.log(`[SPECIAL DEBUG] Received line work data for appointment ID 24375:`, {
      entryCount: data.length,
      firstFew: data.slice(0, 3)
    });
  } else {
    console.log(`Received line work data for appointment ID ${appointmentId}:`, {
      entryCount: data.length
    });
  }
  
  return data;
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
    
    // Sort sub-appointments within the group, if there are any besides the parent
    if (group.length > 1) {
      // The first element is the parent appointment, which should stay first
      const parent = group[0];
      const subAppointments = group.slice(1);
      
      // Sort sub-appointments by their number (everything after the hyphen)
      subAppointments.sort((a, b) => {
        if (!a.appointmentNumber || !b.appointmentNumber) return 0;
        
        const aSubNumber = a.appointmentNumber.split('-')[1];
        const bSubNumber = b.appointmentNumber.split('-')[1];
        
        if (!aSubNumber || !bSubNumber) return 0;
        
        return parseInt(aSubNumber) - parseInt(bSubNumber);
      });
      
      // Reconstruct the group with parent first, then sorted sub-appointments
      sortedAppointments.push(parent, ...subAppointments);
    } else {
      // Just add the single appointment (no sub-appointments)
      sortedAppointments.push(...group);
    }
  });
  
  return sortedAppointments;
};
