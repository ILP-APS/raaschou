import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface AppointmentResponse {
  hnAppointmentID: number;
  appointmentNumber: string;
  subject: string;
  responsibleHnUserID: number;
  hnShippingAddressID: null;
  customerAccountNumber: string;
  project: null;
  description: string;
  startDate: string;
  endDate: string;
  hnAppointmentCategoryID: number;
  hnBudgetID: null;
  hnMainAppointmentID: null;
  blocked: boolean;
  tags: any[];
  customerRef: string;
  ownRef: string;
  done: boolean;
  doneDate: null;
  created: string;
  hnOfferID: null;
  appointmentAssociatedUsers: number[];
}

// Store the mock data to prevent regenerating it on every call
let cachedMockAppointments: AppointmentResponse[] | null = null;

/**
 * Fetches appointment data from the API or returns mock data if API is unavailable
 */
export async function fetchAppointments(): Promise<AppointmentResponse[]> {
  // For production, we would use the real API
  try {
    console.log('Attempting to fetch appointments from API');
    
    // Use the exact API URL from the screenshot
    const apiUrl = 'https://publicapi.e-regnskab.dk/Appointment/Standard?open=true';
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'accept': 'text/plain',
        'ApiKey': 'w9JqSNiTeOIpXfovZOHfjLnM:pGwz'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Successfully fetched', data.length, 'appointments from API');
    
    // Cache the response for future calls
    cachedMockAppointments = data;
    return data;
  } catch (error) {
    console.error('Error fetching from API, using mock data instead:', error);
    
    // If we have cached data, use it
    if (cachedMockAppointments) {
      console.log('Using cached mock appointments');
      return cachedMockAppointments;
    }
    
    // Otherwise generate new mock data
    console.log('Generating mock appointments as API fetch failed');
    cachedMockAppointments = generateMockAppointments();
    return cachedMockAppointments;
  }
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
    const responsibleHnUserID = 18321 + (i % 5); // Based on screenshot: 18321, 18322, etc.
    
    mockData.push({
      hnAppointmentID: 529633 + i, // Based on API example (529633 from screenshot)
      appointmentNumber,
      subject,
      responsibleHnUserID,
      hnShippingAddressID: null,
      customerAccountNumber: "2",
      project: null,
      description: "",
      startDate: "2018-12-31T00:00:00",
      endDate: "2018-12-31T00:00:00",
      hnAppointmentCategoryID: 2257,
      hnBudgetID: null,
      hnMainAppointmentID: null,
      blocked: false,
      tags: [],
      customerRef: "",
      ownRef: "",
      done: false,
      doneDate: null,
      created: "2018-12-28T14:38:49.927",
      hnOfferID: null,
      appointmentAssociatedUsers: [14302, 14339, 14434, 21118, 22903, 37922]
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
    const rows = appointments.map((appointment) => {
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
 * Maps appointments to the format required by our application's table
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
