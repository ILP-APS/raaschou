
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
  hnOfferID: number | null;
  appointmentAssociatedUsers: number[];
  isSubAppointment?: boolean; // Added to track sub-appointments
}

/**
 * Checks if an appointment is a sub-appointment based on its number format
 * Sub-appointments have a format like "24258-3"
 */
export function isSubAppointment(appointmentNumber: string): boolean {
  return /^\d+-\d+$/.test(appointmentNumber);
}

/**
 * Fetches appointment data from the API with proper error handling
 * Returns:
 * 1. All appointments that have a value in hnOfferID
 * 2. All sub-appointments regardless of hnOfferID value
 */
export async function fetchAppointments(): Promise<AppointmentResponse[]> {
  console.log('Fetching appointments from API - with hnOfferID filter and all sub-appointments');
  
  const apiUrl = 'https://publicapi.e-regnskab.dk/Appointment/Standard?open=true';
  const apiKey = 'w9Jq5NiTeOIpXfovZ0Hf1jLnM:pGwZ';
  
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'accept': 'text/plain',
        'ApiKey': apiKey
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status}`, errorText);
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.error('API returned non-array data:', data);
      throw new Error('Invalid data format from API');
    }
    
    // Mark sub-appointments
    const processedData = data.map(appointment => ({
      ...appointment,
      isSubAppointment: isSubAppointment(appointment.appointmentNumber)
    }));
    
    // Filter appointments to include:
    // 1. Those with a non-null hnOfferID
    // 2. All sub-appointments
    const filteredAppointments = processedData.filter(
      appointment => appointment.hnOfferID !== null || appointment.isSubAppointment
    );
    
    console.log(`Successfully fetched ${data.length} appointments from API`);
    console.log(`Filtered to ${filteredAppointments.length} appointments with hnOfferID or sub-appointments`);
    
    return filteredAppointments;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
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
    
    if (!appointments || appointments.length === 0) {
      console.warn("No appointments to save");
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
    
    // Check if we have rows to insert
    if (rows.length === 0) {
      console.warn("No rows to insert");
      return false;
    }
    
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
  
  try {
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
  } catch (error) {
    console.error("Error in loadAppointmentsFromSupabase:", error);
    throw error;
  }
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
    
    // Add a marker for sub-appointments in the last column (used internally)
    if (appointment.isSubAppointment) {
      row[23] = 'sub-appointment';
    } else {
      row[23] = 'parent-appointment';
    }
    
    return row;
  });
}
