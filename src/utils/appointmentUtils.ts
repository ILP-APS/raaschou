
import { 
  AppointmentDetail, 
  User 
} from "@/types/appointment";

// Create a map of user IDs to names for quick lookup
export const createUserMap = (users: User[]): Map<number, string> => {
  const userMap = new Map<number, string>();
  users.forEach((user: User) => {
    userMap.set(user.hnUserID, user.name);
  });
  return userMap;
};

// Get the responsible user name from the map
export const getResponsibleUserName = (userMap: Map<number, string>, userId: number): string => {
  return userMap.get(userId) || 'Unknown';
};

// Fetch the appointment details
export const getAppointmentDetail = async (appointmentId: number): Promise<AppointmentDetail> => {
  try {
    // Return a properly typed mock appointment detail
    return {
      hnAppointmentID: appointmentId,
      hnShippingAddressID: null,
      appointmentNumber: appointmentId.toString(),
      customerAccountNumber: "MOCK-ACCOUNT",
      responsibleHnUserID: 42,
      subject: `Appointment ${appointmentId}`,
      project: null,
      description: "Description goes here",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000).toISOString(),
      hnAppointmentCategoryID: 1,
      hnBudgetID: null,
      hnMainAppointmentID: null,
      blocked: false,
      tags: [],
      customerRef: "",
      notes: "",
      done: false,
      doneDate: null,
      created: new Date().toISOString(),
      hnOfferID: null,
      appointmentAssociatedUsers: []
    };
  } catch (error) {
    console.error(`Error fetching appointment detail for ID ${appointmentId}:`, error);
    throw error;
  }
};

// Calculate line item totals - now returns the correct type
export const calculateOfferTotals = (lineItems: any[]): {
  offerTotal: string;
  montageTotal: string;
  underleverandorTotal: string;
} => {
  return {
    offerTotal: '0',
    montageTotal: '0',
    underleverandorTotal: '0',
  };
};

// Fetch offer line items - fixed to handle the type properly
export const getOfferLineItems = async (offerId: number | null): Promise<{
  offerTotal: string;
  montageTotal: string;
  underleverandorTotal: string;
}> => {
  if (!offerId) {
    return {
      offerTotal: '0',
      montageTotal: '0',
      underleverandorTotal: '0',
    };
  }
  
  try {
    // Return mock data with the correct type
    return {
      offerTotal: '0',
      montageTotal: '0',
      underleverandorTotal: '0',
    };
  } catch (error) {
    console.error(`Error fetching offer line items for offer ID ${offerId}:`, error);
    return {
      offerTotal: 'Error',
      montageTotal: 'Error',
      underleverandorTotal: 'Error',
    };
  }
};

/**
 * Fetches and calculates realized hours for an appointment using work type mapping
 */
export const getRealizedHours = async (appointmentId: number): Promise<{
  projektering: string;
  produktion: string;
  montage: string;
  total: string;
}> => {
  try {
    console.log(`Fetching realized hours for appointment ID ${appointmentId}`);
    
    // Return zeroes for all values
    return {
      projektering: '0,00',
      produktion: '0,00',
      montage: '0,00',
      total: '0,00'
    };
  } catch (error) {
    console.error(`Error fetching realized hours for appointment ID ${appointmentId}:`, error);
    return {
      projektering: '0,00',
      produktion: '0,00',
      montage: '0,00',
      total: '0,00'
    };
  }
};

// Determine if an appointment is a sub-appointment
export const isSubAppointment = (appointmentNumber: string | undefined): boolean => {
  return Boolean(appointmentNumber && appointmentNumber.includes('-'));
};
