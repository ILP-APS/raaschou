export interface Appointment {
  hnAppointmentID: number;
  appointmentNumber: string;
  subject: string;
  customerAccountNumber: string;
  startDate: string | null;
  endDate: string | null;
  hnAppointmentCategoryID: number;
  hnShippingAddressID: number | null;
  done: boolean;
  blocked: boolean;
  tag: string | null;
  tags: string[];
}
