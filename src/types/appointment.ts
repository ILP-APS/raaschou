
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
