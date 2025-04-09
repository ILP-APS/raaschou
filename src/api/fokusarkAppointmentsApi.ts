
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
  timer_tilbage_1?: number | null;
  faerdig_pct_ex_montage_nu?: number | null;
  faerdig_pct_ex_montage_foer?: number | null;
  est_timer_ift_faerdig_pct?: number | null;
  plus_minus_timer?: number | null;
  timer_tilbage_2?: number | null;
  afsat_fragt?: number | null;
  is_sub_appointment?: boolean | null;
  hn_appointment_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetches all fokusark appointments from Supabase
 */
export async function fetchFokusarkAppointments() {
  // Use type assertion to bypass TypeScript's type checking
  const { data, error } = await (supabase
    .from('fokusark_appointments') as any)
    .select('*')
    .order('appointment_number');
    
  if (error) throw error;
  return data as FokusarkAppointment[];
}

/**
 * Upsert a fokusark appointment in Supabase
 * This will either update an existing appointment or create a new one
 */
export async function upsertFokusarkAppointment(appointment: FokusarkAppointment) {
  // Use type assertion to bypass TypeScript's type checking
  const { data, error } = await (supabase
    .from('fokusark_appointments') as any)
    .upsert([appointment], { 
      onConflict: 'appointment_number',
      ignoreDuplicates: false 
    })
    .select()
    .single();
    
  if (error) throw error;
  return data as FokusarkAppointment;
}

/**
 * Batch upsert multiple fokusark appointments
 */
export async function batchUpsertFokusarkAppointments(appointments: FokusarkAppointment[]) {
  // Use type assertion to bypass TypeScript's type checking
  const { data, error } = await (supabase
    .from('fokusark_appointments') as any)
    .upsert(appointments, { 
      onConflict: 'appointment_number',
      ignoreDuplicates: false 
    });
    
  if (error) throw error;
  return data;
}

/**
 * Update a specific field for a fokusark appointment
 */
export async function updateFokusarkAppointmentField(
  appointmentNumber: string, 
  field: string, 
  value: any
) {
  const updateData = {
    [field]: value
  };
  
  // Use type assertion to bypass TypeScript's type checking
  const { data, error } = await (supabase
    .from('fokusark_appointments') as any)
    .update(updateData)
    .eq('appointment_number', appointmentNumber)
    .select()
    .single();
    
  if (error) throw error;
  return data as FokusarkAppointment;
}
