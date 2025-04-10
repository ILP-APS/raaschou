
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
 * (This is a mock implementation since the table doesn't exist yet)
 */
export async function fetchFokusarkAppointments() {
  console.log('Mock: Fetching fokusark appointments');
  return [];
}

/**
 * Upsert a fokusark appointment in Supabase
 * (This is a mock implementation since the table doesn't exist yet)
 */
export async function upsertFokusarkAppointment(appointment: FokusarkAppointment) {
  console.log('Mock: Upserting fokusark appointment', appointment);
  return appointment;
}

/**
 * Batch upsert multiple fokusark appointments
 * (This is a mock implementation since the table doesn't exist yet)
 */
export async function batchUpsertFokusarkAppointments(appointments: FokusarkAppointment[]) {
  console.log('Mock: Batch upserting fokusark appointments', appointments.length);
  return appointments;
}

/**
 * Update a specific field for a fokusark appointment
 * (This is a mock implementation since the table doesn't exist yet)
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
 * (This is a mock implementation since the table doesn't exist yet)
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
