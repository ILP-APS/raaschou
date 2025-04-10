
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

/**
 * Mock implementation for fetching fokusark appointments
 */
export async function fetchFokusarkAppointments(): Promise<FokusarkAppointment[]> {
  // Return cached data if available
  if (cachedMockAppointments) {
    console.log('Using cached mock fokusark appointments');
    return cachedMockAppointments;
  }
  
  console.log('Generating mock fokusark appointments');
  cachedMockAppointments = generateMockAppointments();
  return cachedMockAppointments;
}

/**
 * Mock implementation for upserting a fokusark appointment
 */
export async function upsertFokusarkAppointment(appointment: FokusarkAppointment): Promise<FokusarkAppointment> {
  console.log('Mock: Upserting fokusark appointment', appointment);
  
  // Update cache if it exists
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

/**
 * Mock implementation for batch upserting fokusark appointments
 */
export async function batchUpsertFokusarkAppointments(appointments: FokusarkAppointment[]): Promise<FokusarkAppointment[]> {
  console.log('Mock: Batch upserting fokusark appointments', appointments.length);
  
  // Update the cache
  cachedMockAppointments = appointments;
  
  return appointments;
}

/**
 * Mock implementation for updating a field in a fokusark appointment
 */
export async function updateFokusarkAppointmentField(
  appointmentNumber: string, 
  field: string, 
  value: any
): Promise<FokusarkAppointment> {
  console.log(`Mock: Updating field "${field}" for appointment ${appointmentNumber} to:`, value);
  
  // Create a new mock appointment with the updated field
  const mockAppointment: FokusarkAppointment = {
    appointment_number: appointmentNumber,
    tilbud: 0,
    montage: 0,
    underleverandor: 0,
    [field]: value
  };
  
  // Update the cache if it exists
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

/**
 * Mock implementation for updating realized hours
 */
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
  
  // Update the cache if it exists
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

/**
 * Generate mock appointment data
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
