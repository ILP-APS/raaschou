
import { supabase } from "@/integrations/supabase/client";

export interface FokusarkAppointment {
  id?: string;
  appointment_number: string;
  subject?: string | null;
  responsible_person?: string | null;
  tilbud: number;
  montage: number;
  underleverandor: number;
  montage2?: number | null;
  underleverandor2?: number | null;
  materialer?: number | null;
  projektering_1?: number | null;
  produktion?: number | null;
  montage_3?: number | null;
  total?: number | null;
  projektering_2?: number | null;
  produktion_realized?: number | null;
  timer_tilbage_1?: number | null;
  timer_tilbage_2?: number | null;
  faerdig_pct_ex_montage_nu?: number | null;
  faerdig_pct_ex_montage_foer?: number | null;
  est_timer_ift_faerdig_pct?: number | null;
  plus_minus_timer?: number | null;
  afsat_fragt?: number | null;
  is_sub_appointment?: boolean | null;
  hn_appointment_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetches all fokusark appointments from Supabase
 * Now implemented with mock data for development
 */
export async function fetchFokusarkAppointments() {
  console.log('Fetching fokusark appointments');
  
  try {
    // Try to get data from Supabase if the table exists
    const { data, error } = await supabase
      .from('fokusark_appointments')
      .select('*');
    
    if (error) {
      console.warn('Error fetching fokusark appointments, using mock data:', error);
      return generateMockAppointments();
    }
    
    if (data && data.length > 0) {
      return data;
    } else {
      console.log('No appointments found in database, using mock data');
      return generateMockAppointments();
    }
  } catch (error) {
    console.error('Exception fetching fokusark appointments:', error);
    return generateMockAppointments();
  }
}

/**
 * Upsert a fokusark appointment in Supabase
 * (Now with mock implementation until table exists)
 */
export async function upsertFokusarkAppointment(appointment: FokusarkAppointment) {
  console.log('Mock: Upserting fokusark appointment', appointment);
  return appointment;
}

/**
 * Batch upsert multiple fokusark appointments
 * (Mock implementation until table exists)
 */
export async function batchUpsertFokusarkAppointments(appointments: FokusarkAppointment[]) {
  console.log('Mock: Batch upserting fokusark appointments', appointments.length);
  return appointments;
}

/**
 * Update a specific field for a fokusark appointment
 * (Mock implementation until table exists)
 */
export async function updateFokusarkAppointmentField(
  appointmentNumber: string, 
  field: string, 
  value: any
) {
  console.log(`Mock: Updating field "${field}" for appointment ${appointmentNumber} to:`, value);
  
  const mockAppointment: FokusarkAppointment = {
    appointment_number: appointmentNumber,
    tilbud: 0,
    montage: 0,
    underleverandor: 0,
    [field]: value
  };
  
  return mockAppointment;
}

/**
 * Update realized hours for an appointment
 * (Mock implementation until table exists)
 */
export async function updateRealizedHours(
  appointmentNumber: string,
  projektering: number,
  produktion: number,
  montage: number,
  total: number
) {
  console.log(`Mock: Updating realized hours for ${appointmentNumber}`);
  
  const mockAppointment: FokusarkAppointment = {
    appointment_number: appointmentNumber,
    tilbud: 0,
    montage: 0,
    underleverandor: 0,
    projektering_2: projektering,
    produktion_realized: produktion,
    montage_3: montage,
    total: total
  };
  
  return mockAppointment;
}

/**
 * Generate mock appointment data for development
 */
function generateMockAppointments(): FokusarkAppointment[] {
  const mockData: FokusarkAppointment[] = [];
  
  // Create some sample appointment data
  const subjects = [
    "Construction af udestue", "Installation af gulv", "Repair af køkken", 
    "Maintenance af udestue", "Upgrade af gulv", "Remodel af badeværelse",
    "Replacement af gulv", "Renovation af tag", "Construction af vinduer"
  ];
  
  const responsiblePersons = ["Anna", "Peter", "Maria", "Thomas", "Sofie", "Lars", "Mette"];
  
  for (let i = 0; i < 15; i++) {
    const appointmentNumber = (24481 + i).toString();
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const responsiblePerson = responsiblePersons[Math.floor(Math.random() * responsiblePersons.length)];
    
    // Generate random budget numbers
    const tilbud = Math.floor(Math.random() * 5000) + 1000;
    const montage = Math.floor(tilbud * 0.2);
    const underleverandor = Math.floor(tilbud * 0.15);
    
    mockData.push({
      id: i.toString(),
      appointment_number: appointmentNumber,
      subject,
      responsible_person: responsiblePerson,
      tilbud,
      montage,
      underleverandor,
      hn_appointment_id: 10000 + i,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  console.log(`Generated ${mockData.length} mock appointments`);
  return mockData;
}
