
export interface CustomerAddress {
  accountNumber: string;
  hnCustomerID: number;
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
  city: string;
  country: string;
  contactPersonName: string;
  phoneNumber: string;
  email: string;
  eanNumber: string | null;
}

export interface ShippingAddress {
  hnShippingAddressID?: number;
  customerAccountNumber?: string | null;
  name?: string | null;
  description?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  zipCode?: string | null;
  city?: string | null;
  country?: string | null;
  contactPersonName?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  eanNumber?: string | null;
  internalField?: string | null;
}

export interface Appointment {
  hnAppointmentID: number;
  customerAddress: CustomerAddress;
  shippingAddress: ShippingAddress | null;
  appointmentNumber: string;
}

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

export interface User {
  hnUserID: number;
  name: string;
  username: string;
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
