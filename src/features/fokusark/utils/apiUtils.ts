
// Mock API utility for e-regnskab data
export const fetchOpenAppointments = async () => {
  console.log("Generating mock appointments data");
  return generateMockAppointments();
};

const generateMockAppointments = () => {
  const appointments = [];
  const subjects = [
    "Construction af udestue", "Installation af gulv", "Repair af køkken", 
    "Maintenance af udestue", "Upgrade af gulv", "Remodel af badeværelse",
    "Replacement af gulv", "Renovation af tag", "Construction af vinduer"
  ];
  const people = ["Anna", "Peter", "Maria", "Thomas", "Sofie", "Lars", "Mette"];
  
  for (let i = 0; i < 15; i++) {
    appointments.push({
      hnAppointmentID: 10000 + i,
      appointmentNumber: (24481 + i).toString(),
      subject: subjects[Math.floor(Math.random() * subjects.length)],
      responsibleHnUserID: i % 7 + 1,
      responsibleHnUserName: people[i % 7],
      done: false
    });
  }
  return appointments;
};

export const fetchAppointmentDetail = async (appointmentId: number) => {
  const subjects = [
    "Construction af udestue", "Installation af gulv", "Repair af køkken", 
    "Maintenance af udestue", "Upgrade af gulv", "Remodel af badeværelse"
  ];
  return {
    hnAppointmentID: appointmentId,
    appointmentNumber: appointmentId.toString(),
    subject: subjects[Math.floor(Math.random() * subjects.length)],
    responsibleHnUserID: Math.floor(Math.random() * 5) + 1,
    hnOfferID: Math.floor(Math.random() * 5000) + 8000,
    done: false
  };
};

export const fetchUsers = async () => {
  const users = [];
  const names = ["Anna", "Peter", "Maria", "Thomas", "Sofie", "Lars", "Mette"];
  for (let i = 0; i < names.length; i++) {
    users.push({
      id: i + 1,
      name: names[i],
      email: `${names[i].toLowerCase()}@example.com`
    });
  }
  return users;
};

export const fetchOfferLineItems = async (offerId: number) => {
  console.log(`Offer line items for offer ${offerId} are now synced via edge function`);
  return {
    offerTotal: "0,00",
    montageTotal: "0,00",
    underleverandorTotal: "0,00",
    rawData: [],
  };
};

export const fetchAppointmentLineWork = async (appointmentId: number) => {
  const workEntries = [];
  const workTypes = ["Projektering", "Produktion", "Montage", "Administrativt"];
  for (let i = 0; i < 10; i++) {
    workEntries.push({
      id: 1000 + i,
      appointmentId: appointmentId,
      workType: workTypes[Math.floor(Math.random() * workTypes.length)],
      hours: (Math.random() * 10).toFixed(2),
      date: new Date().toISOString()
    });
  }
  return workEntries;
};

export const sortAndGroupAppointments = (appointments: any[]) => {
  if (!appointments || appointments.length === 0) {
    return generateMockAppointments();
  }
  return appointments;
};

export interface AppointmentDetail {
  hnAppointmentID: number;
  hnShippingAddressID: number | null;
  appointmentNumber: string;
  customerAccountNumber: string;
  responsibleHnUserID: number;
  subject: string;
  project: string | null;
  description: string;
  startDate: string;
  endDate: string;
  hnAppointmentCategoryID: number;
  hnBudgetID: number | null;
  hnMainAppointmentID: number | null;
  blocked: boolean;
  tags: string[];
  customerRef: string;
  notes: string;
  done: boolean;
  doneDate: string | null;
  created: string;
  hnOfferID?: number | null;
  appointmentAssociatedUsers?: number[];
}

export interface OfferLineItem {
  lineID: number;
  itemNumber: string;
  description: string;
  units: number;
  unitName: string;
  costPriceStandardCurrency: number;
  salesPriceStandardCurrency: number;
  totalPriceStandardCurrency: number;
  hnOfferID: number;
  hnBudgetLineID: number | null;
  date: string;
  hnUserID: number;
}

export const getAppointmentDetail = async (appointmentId: number): Promise<AppointmentDetail> => {
  return {
    hnAppointmentID: appointmentId,
    hnShippingAddressID: null,
    appointmentNumber: appointmentId.toString(),
    customerAccountNumber: "",
    responsibleHnUserID: 0,
    subject: "",
    project: null,
    description: "",
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    hnAppointmentCategoryID: 0,
    hnBudgetID: null,
    hnMainAppointmentID: null,
    blocked: false,
    tags: [],
    customerRef: "",
    notes: "",
    done: false,
    doneDate: null,
    created: new Date().toISOString(),
  };
};

export const getOfferLineItems = async (offerId: number) => {
  try {
    const offerData = await fetchOfferLineItems(offerId);
    return {
      offerTotal: offerData.offerTotal,
      montageTotal: offerData.montageTotal,
      underleverandorTotal: offerData.underleverandorTotal
    };
  } catch (error) {
    return { offerTotal: "0,00", montageTotal: "0,00", underleverandorTotal: "0,00" };
  }
};

export const getRealizedHours = async (appointmentId: number) => {
  return {
    projektering: (Math.random() * 20).toFixed(2),
    produktion: (Math.random() * 30).toFixed(2),
    montage: (Math.random() * 25).toFixed(2),
    total: (Math.random() * 75).toFixed(2)
  };
};

export function isSubAppointment(appointmentNumber: string): boolean {
  return /^\d+-\d+$/.test(appointmentNumber);
}

export const api = {
  get: async (url: string) => {
    if (url === '/fokusark/appointments') {
      return { data: await fetchOpenAppointments() };
    }
    throw new Error(`Unhandled URL: ${url}`);
  }
};
