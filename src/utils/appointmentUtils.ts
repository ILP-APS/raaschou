
import { Appointment, AppointmentDetail, OfferLineItem, RealizedHours, User } from "@/types/appointment";

/**
 * Create a map of user IDs to names
 */
export const createUserMap = (users: User[]): Map<number, string> => {
  const userMap = new Map<number, string>();
  users.forEach(user => {
    userMap.set(user.hnUserID, user.name);
  });
  return userMap;
};

/**
 * Mock function to get appointment details
 */
export const getAppointmentDetail = async (appointmentId: number): Promise<AppointmentDetail> => {
  console.log(`Mock: Getting details for appointment ${appointmentId}`);
  
  // Return mock appointment detail
  return {
    hnAppointmentID: appointmentId,
    appointmentNumber: appointmentId.toString(),
    subject: `Mock Appointment ${appointmentId}`,
    responsibleHnUserID: Math.floor(Math.random() * 5) + 1,
    hnOfferID: 1000 + appointmentId,
    done: false,
    hnShippingAddressID: 0, 
    customerAccountNumber: "12345",
    project: "Project Name",
    description: "Description",
    status: "Open",
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    createdDate: new Date().toISOString(),
    modifiedDate: new Date().toISOString(),
    daysOpen: 10,
    percentDone: 0,
    reportingEndDate: new Date().toISOString(),
    customerName: "Customer Name"
  };
};

/**
 * Check if an appointment is a sub-appointment based on number format
 */
export const isSubAppointment = (appointmentNumber: string): boolean => {
  return appointmentNumber.includes('.');
};

/**
 * Mock function to get offer line items
 */
export const getOfferLineItems = async (offerId: number): Promise<{
  offerTotal: string;
  montageTotal: string;
  underleverandorTotal: string;
}> => {
  console.log(`Mock: Getting offer line items for offer ${offerId}`);
  
  // Return mock offer totals
  return {
    offerTotal: (Math.floor(Math.random() * 100000) + 50000).toFixed(2),
    montageTotal: (Math.floor(Math.random() * 20000) + 5000).toFixed(2),
    underleverandorTotal: (Math.floor(Math.random() * 15000) + 2000).toFixed(2)
  };
};

/**
 * Mock function to get realized hours
 */
export const getRealizedHours = async (appointmentId: number): Promise<RealizedHours> => {
  console.log(`Mock: Getting realized hours for appointment ${appointmentId}`);
  
  // Return mock realized hours
  return {
    projektering: (Math.floor(Math.random() * 50) + 10).toString(),
    produktion: (Math.floor(Math.random() * 50) + 10).toString(),
    montage: (Math.floor(Math.random() * 50) + 10).toString(),
    total: (Math.floor(Math.random() * 150) + 30).toString(),
  };
};
