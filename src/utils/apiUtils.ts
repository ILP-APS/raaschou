
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
