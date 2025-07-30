import { format, isToday, isYesterday, isTomorrow, differenceInDays } from 'date-fns';

interface Appointment {
  time?: string;
  start?: string;
  status: string;
  [key: string]: unknown;
}
interface DashboardStats {
  totalVisits: number;
  newPatients: number;
  oldPatients: number;
  todayAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
}

export const formatAppointmentTime = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'h:mm a');
};

export const formatAppointmentDate = (dateString: string): string => {
  const date = new Date(dateString);

  if (isToday(date)) {
    return 'Today';
  } else if (isTomorrow(date)) {
    return 'Tomorrow';
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    const daysDiff = differenceInDays(date, new Date());
    if (daysDiff > 0 && daysDiff <= 7) {
      return format(date, 'EEEE'); // Day of week
    } else {
      return format(date, 'MMM d'); // Month and day
    }
  }
};

export const getAppointmentStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'no_show':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getPatientInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phone;
};

export const calculateAge = (birthDate: string | Date): number => {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

export const getDashboardGreeting = (): string => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Good Morning';
  } else if (hour < 17) {
    return 'Good Afternoon';
  } else {
    return 'Good Evening';
  }
};

export const generateMockStats = (): DashboardStats => {
  return {
    totalVisits: Math.floor(Math.random() * 50) + 20,
    newPatients: Math.floor(Math.random() * 10) + 5,
    oldPatients: Math.floor(Math.random() * 40) + 15,
    todayAppointments: Math.floor(Math.random() * 15) + 5,
    pendingAppointments: Math.floor(Math.random() * 8) + 2,
    completedAppointments: Math.floor(Math.random() * 12) + 3,
  };
};

export const sortAppointmentsByTime = (appointments: Appointment[]): Appointment[] => {
  return appointments.sort((a, b) => {
    const timeA = new Date(a.time || a.start || '').getTime();
    const timeB = new Date(b.time || b.start || '').getTime();
    return timeA - timeB;
  });
};

export const filterAppointmentsByStatus = (appointments: Appointment[], status: string): Appointment[] => {
  return appointments.filter(apt => apt.status === status);
};

export const getAppointmentsByDate = (appointments: Appointment[], date: Date): Appointment[] => {
  const targetDate = format(date, 'yyyy-MM-dd');
  return appointments.filter(apt => {
    const appointmentDate = format(new Date(apt.time || apt.start || ''), 'yyyy-MM-dd');
    return appointmentDate === targetDate;
  });
};

export const calculateCompletionRate = (total: number, completed: number): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};
