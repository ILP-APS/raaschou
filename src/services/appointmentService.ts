
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
 * Directly fetches appointment data from the API - no mock data
 */
export async function fetchAppointments(): Promise<AppointmentResponse[]> {
  console.log('Fetching real appointments from API');
  
  const apiUrl = 'https://publicapi.e-regnskab.dk/Appointment/Standard?open=true';
  const apiKey = 'w9Jq5NiTeOIpXfovZ0Hf1jLnM:pGwZ';
  
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'accept': 'text/plain',
      'ApiKey': apiKey
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error: ${response.status}`, errorText);
    throw new Error(`API responded with status: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('API Response:', data);
  
  if (!Array.isArray(data)) {
    console.error('API returned non-array data:', data);
    throw new Error('Invalid data format from API');
  }
  
  console.log(`Successfully fetched ${data.length} real appointments from API`);
  return data;
}

/**
 * Clear Supabase table and save fresh appointments
 */
export async function saveAppointmentsToSupabase(appointments: AppointmentResponse[]): Promise<boolean> {
  console.log(`Saving ${appointments.length} appointments to Supabase`);
  
  try {
    // First, clear the existing data
    const { error: deleteError } = await supabase
      .from('fokusark_table')
      .delete()
      .not('id', 'is', null);
    
    if (deleteError) {
      console.error("Error clearing table:", deleteError);
      return false;
    }
    
    // Format the appointments for Supabase insertion
    const rows = appointments.map((appointment) => ({
      '1 col': appointment.appointmentNumber || '',
      '2 col': appointment.subject || '',
      '3 col': `User ${appointment.responsibleHnUserID}`,
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
    }));
    
    console.log("Inserting rows to Supabase:", rows.length);
    
    // Insert the data into Supabase
    const { error: insertError } = await supabase
      .from('fokusark_table')
      .insert(rows);
    
    if (insertError) {
      console.error("Error inserting data:", insertError);
      return false;
    }
    
    console.log("Successfully saved appointments to Supabase");
    return true;
  } catch (error) {
    console.error("Error in saveAppointmentsToSupabase:", error);
    return false;
  }
}

/**
 * Load appointments from Supabase
 */
export async function loadAppointmentsFromSupabase(): Promise<string[][]> {
  console.log("Loading appointments from Supabase");
  
  const { data, error } = await supabase
    .from('fokusark_table')
    .select('*')
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error("Error loading from Supabase:", error);
    throw error;
  }
  
  if (!data || data.length === 0) {
    console.log("No data found in Supabase");
    return [];
  }
  
  console.log(`Loaded ${data.length} rows from Supabase`);
  
  // Convert to table format
  const tableData = data.map(row => {
    const rowData: string[] = [];
    for (let i = 1; i <= 24; i++) {
      rowData.push(row[`${i} col`] || '');
    }
    return rowData;
  });
  
  return tableData;
}

/**
 * Maps appointments to table data
 */
export function mapAppointmentsToTableData(appointments: AppointmentResponse[]): string[][] {
  return appointments.map(appointment => {
    const row: string[] = Array(24).fill('');
    row[0] = appointment.appointmentNumber || '';
    row[1] = appointment.subject || '';
    row[2] = `User ${appointment.responsibleHnUserID}`;
    return row;
  });
}
