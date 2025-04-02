
import { 
  AppointmentDetail, 
  OfferLineItem, 
  User 
} from "@/types/appointment";
import { fetchAppointmentDetail, fetchOfferLineItems } from "@/utils/apiUtils";

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
    return await fetchAppointmentDetail(appointmentId);
  } catch (error) {
    console.error(`Error fetching appointment detail for ID ${appointmentId}:`, error);
    throw error;
  }
};

// Calculate line item totals
export const calculateOfferTotals = (lineItems: OfferLineItem[]): {
  offerTotal: string;
  montageTotal: string;
  underleverandorTotal: string;
} => {
  // Calculate the total from all line items
  const total = lineItems.reduce((sum, item) => sum + item.totalPriceStandardCurrency, 0);
  
  // Calculate the total for montage line items
  const montageItems = lineItems.filter(item => item.itemNumber === "Montage");
  const montageSum = montageItems.reduce((sum, item) => sum + item.totalPriceStandardCurrency, 0);
  
  // Calculate the total for underleverandør line items
  const underleverandorItems = lineItems.filter(item => item.itemNumber === "Underleverandør");
  const underleverandorSum = underleverandorItems.reduce((sum, item) => sum + item.totalPriceStandardCurrency, 0);
  
  // Format the totals as strings with thousands separator
  return {
    offerTotal: total.toLocaleString('da-DK'),
    montageTotal: montageSum > 0 ? montageSum.toLocaleString('da-DK') : '0',
    underleverandorTotal: underleverandorSum > 0 ? underleverandorSum.toLocaleString('da-DK') : '0',
  };
};

// Fetch offer line items
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
    const lineItems = await fetchOfferLineItems(offerId);
    return calculateOfferTotals(lineItems);
  } catch (error) {
    console.error(`Error fetching offer line items for offer ID ${offerId}:`, error);
    return {
      offerTotal: 'Error',
      montageTotal: 'Error',
      underleverandorTotal: 'Error',
    };
  }
};

// Determine if an appointment is a sub-appointment
export const isSubAppointment = (appointmentNumber: string | undefined): boolean => {
  return Boolean(appointmentNumber && appointmentNumber.includes('-'));
};
