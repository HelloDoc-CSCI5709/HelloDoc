export interface HealthRecord {
  id: string;
  patientId: string;
  patientName: string;
  documentType: 'X-ray' | 'Lab Report' | 'Prescription' | 'Vaccination Record' | 'Surgical Note';
  fileName: string;
  filePath: string;
  fileType: 'pdf' | 'image' | 'other';
  uploadDate: string;
  uploadedBy: string;
  appointmentId?: string;
  notes?: DoctorNote[];
  status: 'pending' | 'reviewed' | 'archived';
}

export interface DoctorNote {
  id: string;
  doctorId: string;
  doctorName: string;
  note: string;
  createdAt: string;
}

export interface Patient {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  dob?: string;
  gender?: string;
}
