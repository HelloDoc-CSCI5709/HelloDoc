// Basic Profile Types
export interface DoctorBasicInfo {
  fullName: string;
  email: string;
  dob?: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  education?: string;
  specialization?: string[];
  bio?: string;
}

export interface ProfileFormProps {
  initialData: DoctorBasicInfo | null;
  loading: boolean;
  onSubmit: (data: DoctorBasicInfo) => Promise<void>;
  onCancel: () => void;
}

export interface ApiError {
  message: string;
  errors?: string[];
}

export const ALLOWED_SPECIALIZATIONS = [
  'Dermatologist',
  'Cardiologist',
  'Oncologist',
  'Family Medicine',
  'Anesthesiology',
  'Neurologist',
  'Psychiatrist',
  'Radiologist',
  'Gynecologist',
  'Orthopedic Surgeon',
  'Pediatrician',
  'Urologist',
  'ENT Specialist',
  'Gastroenterologist',
  'General Practitioner'
];

// Availability Types
export interface ICSFileData {
  file: File;
  events: ICSEvent[];
  totalSlots: number;
  dateRange: {
    start: Date;
    end: Date;
  };
}

export interface ICSEvent {
  summary: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
  uid: string;
}

export interface AvailabilitySlot {
  id?: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
  isFromICS?: boolean;
}

export interface AvailabilityFormData {
  slots: AvailabilitySlot[];
  icsFile?: File;
}

export interface AvailabilityProps {
  onUploadSuccess: (slots: AvailabilitySlot[]) => void;
  onError: (error: string) => void;
  existingSlots?: AvailabilitySlot[];
}
