
// This file is kept empty intentionally
// No Supabase table interaction since tables were dropped

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

// Stub functions that would normally interact with the database
export async function fetchFokusarkAppointments(): Promise<FokusarkAppointment[]> {
  console.log("fetchFokusarkAppointments called but no implementation exists");
  return [];
}

export async function upsertFokusarkAppointment(appointment: FokusarkAppointment) {
  console.log(`upsertFokusarkAppointment called for appointment ${appointment.appointment_number} but no implementation exists`);
  return appointment;
}

export async function batchUpsertFokusarkAppointments(appointments: FokusarkAppointment[]) {
  console.log(`batchUpsertFokusarkAppointments called with ${appointments.length} appointments but no implementation exists`);
  return null;
}

export async function updateFokusarkAppointmentField(
  appointmentNumber: string, 
  field: string, 
  value: any
) {
  console.log(`updateFokusarkAppointmentField called for appointment ${appointmentNumber}, field ${field} but no implementation exists`);
  return null;
}

export async function updateRealizedHours(
  appointmentNumber: string,
  projektering: number,
  produktion: number,
  montage: number,
  total: number
) {
  console.log(`updateRealizedHours called for appointment ${appointmentNumber} but no implementation exists`);
  return null;
}
