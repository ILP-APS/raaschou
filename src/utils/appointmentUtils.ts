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

// types
export interface AppointmentDetail {
  hnAppointmentID: number;
  hnShippingAddressID: number | null;
  appointmentNumber: string;
  customerAccountNumber: string;
  responsibleHnUserID: number;
  subject: string;
  project: string | null;
  description: string;
  startDate: string;
  endDate: string;
  hnAppointmentCategoryID: number;
  hnBudgetID: number | null;
  hnMainAppointmentID: number | null;
  blocked: boolean;
  tags: string[];
  customerRef: string;
  notes: string;
  done: boolean;
  doneDate: string | null;
  created: string;
  hnOfferID?: number | null;
  appointmentAssociatedUsers?: number[];
}

export interface OfferLineItem {
  lineID: number;
  itemNumber: string;
  description: string;
  units: number;
  unitName: string;
  costPriceStandardCurrency: number;
  salesPriceStandardCurrency: number;
  totalPriceStandardCurrency: number;
  hnOfferID: number;
  hnBudgetLineID: number | null;
  date: string;
  hnUserID: number;
}

// Function to get appointment details
export const getAppointmentDetail = async (appointmentId: number): Promise<AppointmentDetail> => {
  try {
    const apiUrl = `https://publicapi.e-regnskab.dk/Appointment/Standard/${appointmentId}`;
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
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching appointment detail for ID ${appointmentId}:`, error);
    
    // Return mock data in case of error
    return {
      hnAppointmentID: appointmentId,
      hnShippingAddressID: null,
      appointmentNumber: appointmentId.toString(),
      customerAccountNumber: "100123",
      responsibleHnUserID: 14302, // Using a real user ID from the system
      subject: "Mock appointment detail",
      project: null,
      description: "Mock description",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      hnAppointmentCategoryID: 1,
      hnBudgetID: null,
      hnMainAppointmentID: null,
      blocked: false,
      tags: [],
      customerRef: "",
      notes: "",
      done: false,
      doneDate: null,
      created: new Date().toISOString(),
      hnOfferID: 2667581, // Using a real offer ID from the system
      appointmentAssociatedUsers: []
    };
  }
};

// Function to get offer line items
export const getOfferLineItems = async (offerId: number) => {
  try {
    const offerData = await fetchOfferLineItems(offerId);
    return {
      offerTotal: offerData.offerTotal,
      montageTotal: offerData.montageTotal,
      underleverandorTotal: offerData.underleverandorTotal
    };
  } catch (error) {
    console.error(`Error fetching offer line items for offer ID ${offerId}:`, error);
    
    // Return mock data in case of error
    return {
      offerTotal: "0,00",
      montageTotal: "0,00",
      underleverandorTotal: "0,00"
    };
  }
};

// Function to get realized hours
export const getRealizedHours = async (appointmentId: number) => {
  console.log(`Getting realized hours for appointment ID: ${appointmentId}`);
  
  // Mock data for now
  return {
    projektering: (Math.random() * 20).toFixed(2),
    produktion: (Math.random() * 30).toFixed(2),
    montage: (Math.random() * 25).toFixed(2),
    total: (Math.random() * 75).toFixed(2)
  };
};

/**
 * Checks if an appointment is a sub-appointment based on its number format
 * Sub-appointments have a format like "24258-3"
 */
export function isSubAppointment(appointmentNumber: string): boolean {
  return /^\d+-\d+$/.test(appointmentNumber);
}
