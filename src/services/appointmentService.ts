
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

/**
 * Fetches appointment data from the API
 */
export async function fetchAppointments(): Promise<AppointmentResponse[]> {
  try {
    console.log('Fetching real appointments from API');
    
    // Use the exact API URL from the user's screenshot
    const apiUrl = 'https://publicapi.e-regnskab.dk/Appointment/Standard?open=true';
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'accept': 'text/plain',
        'ApiKey': 'w9JqSNiTeOIpXfovZOHfjLnM:pGwz'
      }
    });
    
    if (!response.ok) {
      console.error(`API responded with status: ${response.status}`);
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Successfully fetched', data.length, 'real appointments from API');
    
    if (!data || data.length === 0) {
      console.error('API returned empty data array');
      throw new Error('No appointment data available from API');
    }
    
    // Log a sample of the first appointment to verify data structure
    if (data.length > 0) {
      console.log('Sample appointment data:', {
        id: data[0].hnAppointmentID,
        number: data[0].appointmentNumber,
        subject: data[0].subject
      });
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching from API:', error);
    throw error; // Propagate the error instead of returning mock data
  }
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
      .not('id', 'is', null); // Delete all rows
    
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
    
    console.log("Successfully saved real appointments to Supabase");
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
    
    // The rest of the columns will be empty
    return row;
  });
}
