
import { AppointmentDetail } from "@/types/appointment";

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
