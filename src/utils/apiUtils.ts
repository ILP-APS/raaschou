
// Mock API utility for e-regnskab data
export const fetchOpenAppointments = async () => {
  console.log("Generating mock appointments data");
  return generateMockAppointments();
};

// Generate mock appointments
const generateMockAppointments = () => {
  console.log("Generating mock appointments data");
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

// Mock fetch appointment details
export const fetchAppointmentDetail = async (appointmentId: number) => {
  console.log(`Generating mock appointment detail for ID ${appointmentId}`);
  
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

// Mock fetch users
export const fetchUsers = async () => {
  console.log("Generating mock users");
  
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

// Mock fetch offer line items
export const fetchOfferLineItems = async (offerId: number) => {
  console.log(`Generating mock offer line items for offer ID ${offerId}`);
  
  const total = Math.floor(Math.random() * 50000) + 40000;
  const montage = Math.floor(total * 0.2);
  const underleverandor = Math.floor(total * 0.15);
  
  return {
    offerTotal: total.toFixed(2).replace('.', ','),
    montageTotal: montage.toFixed(2).replace('.', ','),
    underleverandorTotal: underleverandor.toFixed(2).replace('.', ',')
  };
};

// Mock fetch appointment line work data
export const fetchAppointmentLineWork = async (appointmentId: number) => {
  console.log(`Generating mock line work data for appointment ID: ${appointmentId}`);
  
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

// Sort and group appointments with mock data
export const sortAndGroupAppointments = (appointments: any[]) => {
  if (!appointments || appointments.length === 0) {
    console.log("No appointments to sort, using mock data");
    return generateMockAppointments();
  }
  
  // Just return the appointments as is for simplicity
  return appointments;
};
