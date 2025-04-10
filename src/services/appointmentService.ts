
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getUserName, preloadUsers } from "@/utils/userUtils";
import { fetchOfferLineItems } from "@/utils/apiUtils";

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
  isSubAppointment?: boolean;
  parentAppointmentNumber?: string;
}

/**
 * Checks if an appointment is a sub-appointment based on its number format
 * Sub-appointments have a format like "24258-3"
 */
export function isSubAppointment(appointmentNumber: string): boolean {
  return /^\d+-\d+$/.test(appointmentNumber);
}

/**
 * Extract the parent appointment number from a sub-appointment
 * For example, from "24258-3" returns "24258"
 */
export function getParentAppointmentNumber(appointmentNumber: string): string | null {
  if (!isSubAppointment(appointmentNumber)) return null;
  
  const parts = appointmentNumber.split('-');
  return parts[0];
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
    
    // Process appointments to identify sub-appointments and their parents
    const processedData = data.map(appointment => {
      const isSubApp = isSubAppointment(appointment.appointmentNumber);
      const parentNumber = isSubApp ? getParentAppointmentNumber(appointment.appointmentNumber) : null;
      
      return {
        ...appointment,
        isSubAppointment: isSubApp,
        parentAppointmentNumber: parentNumber
      };
    });
    
    // Filter appointments to include:
    // 1. Those with a non-null hnOfferID
    // 2. All sub-appointments
    const filteredAppointments = processedData.filter(
      appointment => appointment.hnOfferID !== null || appointment.isSubAppointment
    );
    
    // Sort appointments:
    // 1. First by numeric part of appointment number
    // 2. Then group sub-appointments after their parent
    const sortedAppointments = sortAppointments(filteredAppointments);
    
    console.log(`Successfully fetched ${data.length} appointments from API`);
    console.log(`Filtered to ${filteredAppointments.length} appointments with hnOfferID or sub-appointments`);
    console.log(`Sorted appointments to group sub-appointments with parents`);
    
    return sortedAppointments;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
}

/**
 * Sort appointments by number and group sub-appointments with their parent
 */
function sortAppointments(appointments: AppointmentResponse[]): AppointmentResponse[] {
  // First, create a map to quickly find parent appointments
  const appointmentMap = new Map<string, AppointmentResponse>();
  appointments.forEach(app => {
    appointmentMap.set(app.appointmentNumber, app);
  });
  
  // Separate parents and sub-appointments
  const parents: AppointmentResponse[] = [];
  const subAppointments: AppointmentResponse[] = [];
  
  appointments.forEach(app => {
    if (app.isSubAppointment) {
      subAppointments.push(app);
    } else {
      parents.push(app);
    }
  });
  
  // Sort parents numerically by appointment number
  parents.sort((a, b) => {
    const numA = parseInt(a.appointmentNumber.replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(b.appointmentNumber.replace(/\D/g, ''), 10) || 0;
    return numA - numB;
  });
  
  // Group sub-appointments with their parents
  const result: AppointmentResponse[] = [];
  
  for (const parent of parents) {
    // Add parent
    result.push(parent);
    
    // Find and add all children, sorted by their suffix
    const children = subAppointments
      .filter(sub => sub.parentAppointmentNumber === parent.appointmentNumber)
      .sort((a, b) => {
        const suffixA = a.appointmentNumber.split('-')[1];
        const suffixB = b.appointmentNumber.split('-')[1];
        return parseInt(suffixA, 10) - parseInt(suffixB, 10);
      });
    
    result.push(...children);
  }
  
  // Add any orphaned sub-appointments at the end
  const orphanedSubs = subAppointments.filter(
    sub => !parents.some(p => p.appointmentNumber === sub.parentAppointmentNumber)
  );
  
  if (orphanedSubs.length > 0) {
    console.log(`Found ${orphanedSubs.length} sub-appointments without a parent in the filtered data`);
    result.push(...orphanedSubs);
  }
  
  return result;
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
    
    // Preload user data for all appointments to improve performance
    const userIds = appointments
      .map(app => app.responsibleHnUserID)
      .filter((id): id is number => id !== undefined && id !== null);
    
    console.log(`Preloading ${userIds.length} user details...`);
    await preloadUsers(userIds);
    
    // Format the appointments for Supabase insertion, getting user names as needed
    const rowPromises = appointments.map(async (appointment) => {
      // Get the responsible user's actual name
      const responsibleUserName = appointment.responsibleHnUserID ? 
        await getUserName(appointment.responsibleHnUserID) : 
        'Unknown';
      
      return {
        '1 col': appointment.appointmentNumber || '',
        '2 col': appointment.subject || '',
        '3 col': responsibleUserName,
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
    
    const rows = await Promise.all(rowPromises);
    
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
export function mapAppointmentsToTableData(appointments: AppointmentResponse[]): Promise<string[][]> {
  return preloadUsers(appointments
    .map(app => app.responsibleHnUserID)
    .filter((id): id is number => id !== undefined && id !== null))
    .then(async () => {
      // Process each appointment to create rows
      const rows = await Promise.all(appointments.map(async appointment => {
        const row: string[] = Array(24).fill('');
        row[0] = appointment.appointmentNumber || '';
        row[1] = appointment.subject || '';
        
        // Get the responsible user's actual name
        const responsibleUserName = appointment.responsibleHnUserID ? 
          await getUserName(appointment.responsibleHnUserID) : 
          'Unknown';
        
        row[2] = responsibleUserName;
        
        // Fetch offer data for column 4 if we have an offer ID
        if (appointment.hnOfferID) {
          try {
            console.log(`Fetching offer data for appointment ${appointment.appointmentNumber}`);
            const offerData = await fetchOfferLineItems(appointment.hnOfferID);
            
            // Add offer total to column 4
            row[3] = offerData.offerTotal;
            // Add montage total to column 4
            row[4] = offerData.montageTotal;
            // Add underleverandor total to column 5
            row[5] = offerData.underleverandorTotal;
          } catch (error) {
            console.error(`Error fetching offer data for appointment ${appointment.appointmentNumber}:`, error);
            // Set empty values if we can't fetch the data
            row[3] = '';
            row[4] = '';
            row[5] = '';
          }
        }
        
        // Add a marker for sub-appointments in the last column (used internally)
        if (appointment.isSubAppointment) {
          row[23] = 'sub-appointment';
        } else {
          row[23] = 'parent-appointment';
        }
        
        return row;
      }));
      
      return rows;
    });
}
