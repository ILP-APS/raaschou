
// Cached mock appointments to prevent regeneration
let cachedMockAppointments: FokusarkAppointment[] | null = null;

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

export async function fetchFokusarkAppointments(): Promise<FokusarkAppointment[]> {
  if (cachedMockAppointments) {
    console.log('Using cached mock fokusark appointments');
    return cachedMockAppointments;
  }
  console.log('Generating mock fokusark appointments');
  cachedMockAppointments = generateMockAppointments();
  return cachedMockAppointments;
}

export async function upsertFokusarkAppointment(appointment: FokusarkAppointment): Promise<FokusarkAppointment> {
  console.log('Mock: Upserting fokusark appointment', appointment);
  if (cachedMockAppointments) {
    const existingIndex = cachedMockAppointments.findIndex(
      app => app.appointment_number === appointment.appointment_number
    );
    if (existingIndex >= 0) {
      cachedMockAppointments[existingIndex] = appointment;
    } else {
      cachedMockAppointments.push(appointment);
    }
  }
  return appointment;
}

export async function batchUpsertFokusarkAppointments(appointments: FokusarkAppointment[]): Promise<FokusarkAppointment[]> {
  console.log('Mock: Batch upserting fokusark appointments', appointments.length);
  cachedMockAppointments = appointments;
  return appointments;
}

export async function updateFokusarkAppointmentField(
  appointmentNumber: string, 
  field: string, 
  value: any
): Promise<FokusarkAppointment> {
  console.log(`Mock: Updating field "${field}" for appointment ${appointmentNumber} to:`, value);
  const mockAppointment: FokusarkAppointment = {
    appointment_number: appointmentNumber,
    tilbud: 0,
    montage: 0,
    underleverandor: 0,
    [field]: value
  };
  if (cachedMockAppointments) {
    const existingIndex = cachedMockAppointments.findIndex(
      app => app.appointment_number === appointmentNumber
    );
    if (existingIndex >= 0) {
      cachedMockAppointments[existingIndex] = {
        ...cachedMockAppointments[existingIndex],
        [field]: value
      };
    }
  }
  return mockAppointment;
}

export async function updateRealizedHours(
  appointmentNumber: string,
  projektering: number,
  produktion: number,
  montage: number,
  total: number
): Promise<FokusarkAppointment> {
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
  if (cachedMockAppointments) {
    const existingIndex = cachedMockAppointments.findIndex(
      app => app.appointment_number === appointmentNumber
    );
    if (existingIndex >= 0) {
      cachedMockAppointments[existingIndex] = {
        ...cachedMockAppointments[existingIndex],
        projektering_2: projektering,
        produktion_realized: produktion,
        montage_3: montage,
        total: total
      };
    }
  }
  return mockAppointment;
}

function generateMockAppointments(): FokusarkAppointment[] {
  const mockData: FokusarkAppointment[] = [];
  const subjects = [
    "Skoleophold m.v.", "Tilbygning", "Kontorudvidelse", 
    "Køkkenrenovering", "Vinduesudskiftning", "Tagudskiftning",
    "Facaderenovering", "Energirenovering", "Kloakrenovering"
  ];
  const responsiblePersons = ["User 1832", "User 1833", "User 1834", "User 1835", "User 1836"];
  
  for (let i = 0; i < 15; i++) {
    const appointmentNumber = `${9990 + i}`;
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const responsiblePerson = responsiblePersons[Math.floor(Math.random() * responsiblePersons.length)];
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
      hn_appointment_id: 529633 + i,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  return mockData;
}
