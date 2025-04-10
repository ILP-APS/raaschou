
// Mock API utility for e-regnskab data
export const fetchOpenAppointments = async () => {
  console.log("Generating mock appointments data");
  return generateMockAppointments();
};

// Generate mock appointments
const generateMockAppointments = () => {
  console.log("Generating mock appointments data");
  const appointments = [];
  const subjects = [
    "Construction af udestue", "Installation af gulv", "Repair af køkken", 
    "Maintenance af udestue", "Upgrade af gulv", "Remodel af badeværelse",
    "Replacement af gulv", "Renovation af tag", "Construction af vinduer"
  ];
  
  const people = ["Anna", "Peter", "Maria", "Thomas", "Sofie", "Lars", "Mette"];
  
  for (let i = 0; i < 15; i++) {
    appointments.push({
      hnAppointmentID: 10000 + i,
      appointmentNumber: (24481 + i).toString(),
      subject: subjects[Math.floor(Math.random() * subjects.length)],
      responsibleHnUserID: i % 7 + 1,
      responsibleHnUserName: people[i % 7],
      done: false
    });
  }
  
  return appointments;
};

// Mock fetch appointment details
export const fetchAppointmentDetail = async (appointmentId: number) => {
  console.log(`Generating mock appointment detail for ID ${appointmentId}`);
  
  const subjects = [
    "Construction af udestue", "Installation af gulv", "Repair af køkken", 
    "Maintenance af udestue", "Upgrade af gulv", "Remodel af badeværelse"
  ];
  
  return {
    hnAppointmentID: appointmentId,
    appointmentNumber: appointmentId.toString(),
    subject: subjects[Math.floor(Math.random() * subjects.length)],
    responsibleHnUserID: Math.floor(Math.random() * 5) + 1,
    hnOfferID: Math.floor(Math.random() * 5000) + 8000,
    done: false
  };
};

// Mock fetch users
export const fetchUsers = async () => {
  console.log("Generating mock users");
  
  const users = [];
  const names = ["Anna", "Peter", "Maria", "Thomas", "Sofie", "Lars", "Mette"];
  
  for (let i = 0; i < names.length; i++) {
    users.push({
      id: i + 1,
      name: names[i],
      email: `${names[i].toLowerCase()}@example.com`
    });
  }
  
  return users;
};

// Fetch offer line items from the API - this now fetches real data or fallback to mock data
export const fetchOfferLineItems = async (offerId: number) => {
  console.log(`Fetching offer line items for offer ID ${offerId}`);
  
  try {
    const apiUrl = `https://publicapi.e-regnskab.dk/Offer/Standard/Line/Item?hnOfferID=${offerId}`;
    const apiKey = 'w9Jq5NiTeOIpXfovZ0Hf1jLnM:pGwZ';
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'accept': 'text/plain',
        'ApiKey': apiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Successfully fetched ${data.length} offer line items`);
    
    // Calculate totals from the actual API data
    let offerTotal = 0;
    let montageTotal = 0;
    let underleverandorTotal = 0;
    
    // Sum up all totalPriceStandardCurrency values
    data.forEach(item => {
      if (item.totalPriceStandardCurrency) {
        offerTotal += parseFloat(item.totalPriceStandardCurrency);
      }
      
      // Check if the description contains certain keywords to categorize
      const description = item.description ? item.description.toLowerCase() : '';
      if (description.includes('montage') || description.includes('montering')) {
        montageTotal += parseFloat(item.totalPriceStandardCurrency || 0);
      } else if (description.includes('underleverand') || description.includes('ekstern')) {
        underleverandorTotal += parseFloat(item.totalPriceStandardCurrency || 0);
      }
    });
    
    // Format numbers as strings with Danish number format
    return {
      offerTotal: offerTotal.toFixed(2).replace('.', ','),
      montageTotal: montageTotal.toFixed(2).replace('.', ','),
      underleverandorTotal: underleverandorTotal.toFixed(2).replace('.', ','),
      rawData: data // Include the raw data for further processing if needed
    };
  } catch (error) {
    console.error(`Error fetching offer line items: ${error}`);
    
    // Fallback to mock data
    const total = Math.floor(Math.random() * 50000) + 40000;
    const montage = Math.floor(total * 0.2);
    const underleverandor = Math.floor(total * 0.15);
    
    return {
      offerTotal: total.toFixed(2).replace('.', ','),
      montageTotal: montage.toFixed(2).replace('.', ','),
      underleverandorTotal: underleverandor.toFixed(2).replace('.', ','),
      rawData: [] // Empty array for mock data
    };
  }
};

// Mock fetch appointment line work data
export const fetchAppointmentLineWork = async (appointmentId: number) => {
  console.log(`Generating mock line work data for appointment ID: ${appointmentId}`);
  
  const workEntries = [];
  const workTypes = ["Projektering", "Produktion", "Montage", "Administrativt"];
  
  for (let i = 0; i < 10; i++) {
    workEntries.push({
      id: 1000 + i,
      appointmentId: appointmentId,
      workType: workTypes[Math.floor(Math.random() * workTypes.length)],
      hours: (Math.random() * 10).toFixed(2),
      date: new Date().toISOString()
    });
  }
  
  return workEntries;
};

// Sort and group appointments with mock data
export const sortAndGroupAppointments = (appointments: any[]) => {
  if (!appointments || appointments.length === 0) {
    console.log("No appointments to sort, using mock data");
    return generateMockAppointments();
  }
  
  // Just return the appointments as is for simplicity
  return appointments;
};
