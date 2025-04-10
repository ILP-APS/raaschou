
import { useState, useEffect } from "react";
import { Appointment } from "@/types/appointment";
import { useToast } from "@/hooks/use-toast";

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setIsLoading(true);
        // Create mock data instead of API fetching
        const mockAppointments: Appointment[] = [
          {
            hnAppointmentID: 24371,
            appointmentNumber: "24371",
            subject: "Inventar hotel avenue",
            customerAddress: {
              accountNumber: "CUST001",
              hnCustomerID: 1001,
              name: "Hotel Avenue",
              addressLine1: "Main Street 123",
              addressLine2: "",
              zipCode: "1000",
              city: "Copenhagen",
              country: "Denmark",
              contactPersonName: "John Doe",
              phoneNumber: "12345678",
              email: "contact@hotelavenue.com",
              eanNumber: null
            },
            shippingAddress: null,
            responsibleHnUserID: 42
          },
          {
            hnAppointmentID: 24372,
            appointmentNumber: "24372",
            subject: "Renovation af kontor",
            customerAddress: {
              accountNumber: "CUST002",
              hnCustomerID: 1002,
              name: "Office Solutions A/S",
              addressLine1: "Business Park 45",
              addressLine2: "",
              zipCode: "2100",
              city: "Copenhagen",
              country: "Denmark",
              contactPersonName: "Jane Smith",
              phoneNumber: "87654321",
              email: "jane@officesolutions.dk",
              eanNumber: null
            },
            shippingAddress: null,
            responsibleHnUserID: 43
          },
          {
            hnAppointmentID: 24373,
            appointmentNumber: "24373",
            subject: "Møbler til restaurant",
            customerAddress: {
              accountNumber: "CUST003",
              hnCustomerID: 1003,
              name: "Gourmet Restaurant",
              addressLine1: "Food Street 67",
              addressLine2: "",
              zipCode: "8000",
              city: "Aarhus",
              country: "Denmark",
              contactPersonName: "Chef Anders",
              phoneNumber: "23456789",
              email: "anders@gourmetrestaurant.dk",
              eanNumber: null
            },
            shippingAddress: null,
            responsibleHnUserID: 44
          }
        ];
        
        console.log(`Created ${mockAppointments.length} mock appointments`);
        
        if (mockAppointments.length > 0) {
          console.log("First mock appointment subject:", mockAppointments[0].subject);
        }
        
        setAppointments(mockAppointments);
      } catch (err) {
        console.error("Error setting up mock appointments:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        toast({
          title: "Error loading appointments",
          description: "Failed to set up mock appointment data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAppointments();
  }, [toast]);

  return { appointments, isLoading, error };
};
