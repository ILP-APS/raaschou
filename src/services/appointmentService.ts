
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  
  // Real subjects from the API
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
 * Save appointment data to Supabase
 */
export async function saveAppointmentsToSupabase(appointments: AppointmentResponse[]): Promise<boolean> {
  try {
    console.log(`Saving ${appointments.length} appointments to Supabase`);
    
    // First, clear the existing fokusark_table to avoid duplicates
    const { error: deleteError } = await supabase
      .from('fokusark_table')
      .delete()
      .not('id', 'is', null); // Delete all rows (safer than hardcoding a UUID)
    
    if (deleteError) {
      console.error("Error clearing existing fokusark_table data:", deleteError);
      return false;
    }
    
    // Format appointment data for Supabase insertion
    const rows = appointments.map((appointment, index) => {
      return {
        // Don't use crypto.randomUUID() as it might not be available in all browsers
        // Let Supabase generate the UUID with its default
        '1 col': appointment.appointmentNumber,
        '2 col': appointment.subject,
        '3 col': `User ${appointment.responsibleHnUserID}`, // Map user ID to a user name format
        // Add empty values for remaining columns
        '4 col': '',
        '5 col': '',
        '6 col': '',
        '7 col': '',
        '8 col': '',
        '9 col': '',
        '10 col': '',
        '11 col': '',
        '12 col': '',
        '13 col': '',
        '14 col': '',
        '15 col': '',
        '16 col': '',
        '17 col': '',
        '18 col': '',
        '19 col': '',
        '20 col': '',
        '21 col': '',
        '22 col': '',
        '23 col': '',
        '24 col': ''
      };
    });
    
    // Insert data into Supabase
    const { error: insertError } = await supabase
      .from('fokusark_table')
      .insert(rows);
    
    if (insertError) {
      console.error("Error inserting appointment data into Supabase:", insertError);
      return false;
    }
    
    console.log("Successfully saved appointments to Supabase");
    return true;
  } catch (error) {
    console.error("Error saving appointments to Supabase:", error);
    return false;
  }
}

/**
 * Load appointment data from Supabase and map to table format
 */
export async function loadAppointmentsFromSupabase(): Promise<string[][]> {
  try {
    console.log("Loading appointments from Supabase");
    
    const { data, error } = await supabase
      .from('fokusark_table')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error("Error loading appointment data from Supabase:", error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log("No appointment data found in Supabase");
      return [];
    }
    
    console.log(`Loaded ${data.length} appointments from Supabase`);
    
    // Convert Supabase data format to table data format
    const tableData = data.map(row => {
      const rowData: string[] = [];
      for (let i = 1; i <= 24; i++) {
        rowData.push(row[`${i} col`] || '');
      }
      return rowData;
    });
    
    console.log("Successfully mapped Supabase data to table format");
    return tableData;
  } catch (error) {
    console.error("Error loading appointments from Supabase:", error);
    return [];
  }
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
    row[2] = `User ${appointment.responsibleHnUserID}`;
    
    // Add some mock budget values for the demo
    row[3] = (Math.floor(Math.random() * 5000) + 500).toFixed(2);
    row[4] = (Math.floor(Math.random() * 1000) + 100).toFixed(2);
    row[5] = (Math.floor(Math.random() * 1000) + 100).toFixed(2);
    
    return row;
  });
}
