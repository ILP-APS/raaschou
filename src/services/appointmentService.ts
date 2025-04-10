
import { toast } from "sonner";

export interface AppointmentResponse {
  hnAppointmentID: number;
  appointmentNumber: string;
  subject: string;
  responsibleHnUserID: number;
  // Add other fields as needed
}

// Store the mock data to prevent regenerating it on every call
let cachedMockAppointments: AppointmentResponse[] | null = null;

/**
 * Provides mock appointment data since API fetching is disabled
 */
export async function fetchAppointments(): Promise<AppointmentResponse[]> {
  if (cachedMockAppointments) {
    console.log('Using cached mock appointments');
    return cachedMockAppointments;
  }
  
  console.log('Generating mock appointments instead of API fetch');
  cachedMockAppointments = generateMockAppointments();
  return cachedMockAppointments;
}

/**
 * Generates mock appointment data for development and testing
 * that matches the structure seen in the API response
 */
function generateMockAppointments(): AppointmentResponse[] {
  const mockData: AppointmentResponse[] = [];
  
  // Sample subjects from the API
  const subjects = [
    "Skoleophold m.v.", "Tilbygning", "Kontorudvidelse", 
    "Køkkenrenovering", "Vinduesudskiftning", "Tagudskiftning",
    "Facaderenovering", "Energirenovering", "Kloakrenovering"
  ];
  
  // Generate appointment numbers like in the API (4-digit format)
  for (let i = 0; i < 15; i++) {
    const appointmentNumber = `${9990 + i}`; // Starting from 9990 like in the API
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    
    mockData.push({
      hnAppointmentID: 529633 + i, // Based on API example
      appointmentNumber,
      subject,
      responsibleHnUserID: 1832 + (i % 5) // Varied user IDs
    });
  }
  
  console.log(`Generated ${mockData.length} mock appointments that match API format`);
  return mockData;
}

/**
 * Maps mock data to the format required by our application
 */
export function mapAppointmentsToTableData(appointments: AppointmentResponse[]): string[][] {
  console.log(`Mapping ${appointments.length} appointments to table data`);
  
  return appointments.map(appointment => {
    // Create a row with appointmentNumber and subject in the first two columns
    const row: string[] = Array(24).fill('');
    row[0] = appointment.appointmentNumber;
    row[1] = appointment.subject || '';
    
    // Add some mock budget values for the demo
    row[3] = (Math.floor(Math.random() * 5000) + 500).toFixed(2);
    row[4] = (Math.floor(Math.random() * 1000) + 100).toFixed(2);
    row[5] = (Math.floor(Math.random() * 1000) + 100).toFixed(2);
    
    return row;
  });
}
