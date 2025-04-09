
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
  is_sub_appointment?: boolean | null;
  hn_appointment_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetches all fokusark appointments from Supabase
 */
export async function fetchFokusarkAppointments() {
  const { data, error } = await supabase
    .from('fokusark_appointments')
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
  const { data, error } = await supabase
    .from('fokusark_appointments')
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
  const { data, error } = await supabase
    .from('fokusark_appointments')
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
  
  const { data, error } = await supabase
    .from('fokusark_appointments')
    .update(updateData)
    .eq('appointment_number', appointmentNumber)
    .select()
    .single();
    
  if (error) throw error;
  return data as FokusarkAppointment;
}
