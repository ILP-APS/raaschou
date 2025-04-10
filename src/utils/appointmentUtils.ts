
import { AppointmentDetail, User } from "@/types/appointment";

/**
 * Performs validation of an appointment object
 */
export function validateAppointment(appointment: AppointmentDetail): boolean {
  return (
    !!appointment &&
    !!appointment.appointmentNumber &&
    appointment.appointmentNumber.length > 0
  );
}

/**
 * Checks if an appointment is a subappointment
 */
export function isSubAppointment(appointmentNumber: string): boolean {
  // Sample implementation - in a real app this might check for special prefixes
  // or would compare against the mainAppointmentID field
  return appointmentNumber.includes('-sub');
}

/**
 * Creates a default appointment object
 */
export function createDefaultAppointment(): AppointmentDetail {
  return {
    hnAppointmentID: 0,
    hnShippingAddressID: null,
    appointmentNumber: '',
    customerAccountNumber: '',
    responsibleHnUserID: 0,
    subject: '',
    project: null,
    description: '',
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    hnAppointmentCategoryID: 0,
    hnBudgetID: null,
    hnMainAppointmentID: null,
    blocked: false,
    tags: [],
    customerRef: '',
    notes: '',
    done: false,
    doneDate: null,
    created: new Date().toISOString()
  };
}

/**
 * Creates a map of users by ID for easy lookup
 */
export function createUserMap(users: User[]): Map<number, string> {
  const userMap = new Map<number, string>();
  users.forEach(user => {
    userMap.set(user.hnUserID, user.fullName);
  });
  return userMap;
}

/**
 * Mock implementation of getting appointment details
 */
export async function getAppointmentDetail(appointmentId: number): Promise<AppointmentDetail> {
  // Return a simplified mock appointment detail
  const detail: AppointmentDetail = {
    hnAppointmentID: appointmentId,
    hnShippingAddressID: null,
    appointmentNumber: `${9990 + (appointmentId % 100)}`,
    customerAccountNumber: 'CUST-123',
    responsibleHnUserID: 1832 + (appointmentId % 5),
    subject: `Appointment ${appointmentId}`,
    project: null,
    description: 'Sample appointment',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    hnAppointmentCategoryID: 1,
    hnBudgetID: null,
    hnMainAppointmentID: null,
    blocked: false,
    tags: [],
    customerRef: '',
    notes: '',
    done: false,
    doneDate: null,
    created: new Date().toISOString(),
    hnOfferID: 12345 // Added for getOfferLineItems
  };
  
  console.log(`Mock: Generated appointment detail for ID ${appointmentId}`);
  return detail;
}

/**
 * Mock implementation of getting offer line items
 */
export async function getOfferLineItems(offerId: number): Promise<{
  offerTotal: string;
  montageTotal: string;
  underleverandorTotal: string;
}> {
  // Generate some reasonable mock values
  const offerTotal = (Math.floor(Math.random() * 100000) + 50000).toFixed(2);
  const montageTotal = (parseFloat(offerTotal) * 0.2).toFixed(2);
  const underleverandorTotal = (parseFloat(offerTotal) * 0.15).toFixed(2);
  
  return {
    offerTotal: offerTotal.replace('.', ','),
    montageTotal: montageTotal.replace('.', ','),
    underleverandorTotal: underleverandorTotal.replace('.', ',')
  };
}

/**
 * Mock implementation of getting realized hours
 */
export async function getRealizedHours(appointmentId: number): Promise<{
  projektering: string;
  produktion: string;
  montage: string;
  total: string;
}> {
  // Generate some reasonable mock values
  const projektering = (Math.floor(Math.random() * 100) + 20).toFixed(2);
  const produktion = (Math.floor(Math.random() * 200) + 50).toFixed(2);
  const montage = (Math.floor(Math.random() * 150) + 30).toFixed(2);
  const total = (parseFloat(projektering) + parseFloat(produktion) + parseFloat(montage)).toFixed(2);
  
  return {
    projektering,
    produktion,
    montage,
    total
  };
}
