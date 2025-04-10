
import { toast } from "sonner";

export interface AppointmentResponse {
  hnAppointmentID: number;
  appointmentNumber: string;
  subject: string;
  responsibleHnUserID: number;
  // Add other fields as needed
}

/**
 * Fetches appointments from the e-regnskab API
 */
export async function fetchAppointments(): Promise<AppointmentResponse[]> {
  try {
    console.log('Fetching appointments from external API...');
    const response = await fetch('https://publicapi.e-regnskab.dk/Appointment/Standard?open=true', {
      method: 'GET',
      headers: {
        'Accept': 'text/plain',
        'ApiKey': 'w9Jq5NiTeOIpXfovZ0HfijLnM:p6wZ'
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data: AppointmentResponse[] = await response.json();
    console.log(`Fetched ${data.length} appointments from API`);
    return data;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    toast.error('Failed to fetch appointments from external API');
    return [];
  }
}

/**
 * Maps external API data to the format required by our application
 */
export function mapAppointmentsToTableData(appointments: AppointmentResponse[]): string[][] {
  console.log(`Mapping ${appointments.length} appointments to table data`);
  
  return appointments.map(appointment => {
    // Create a row with appointmentNumber and subject in the first two columns
    const row: string[] = Array(24).fill('');
    row[0] = appointment.appointmentNumber;
    row[1] = appointment.subject || '';
    
    return row;
  });
}
