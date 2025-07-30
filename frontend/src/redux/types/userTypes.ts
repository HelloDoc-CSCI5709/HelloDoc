// src/redux/types/userTypes.ts
export interface UserProfile {
  fullName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
}

export interface User {
  
  id: string;
  email: string;
  name?: string;
  isVerified: boolean;
  role: 'patient' | 'doctor' | 'admin';
  profile?: UserProfile;
}

export interface VerificationResponse {
  isVerified: boolean;
  user?: User;
}

export type VerificationStatus = 'pending' | 'verified' | 'unverified' | null;

export interface UserState {
  doctorsError: boolean;
  selectedDoctor: boolean;
  doctorsLoading: boolean;
  doctors: never[];
  profile: UserProfile | undefined;
  userId: string | undefined;
  role: 'patient' | 'doctor' | 'admin' | undefined;
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  verificationStatus: VerificationStatus;
}