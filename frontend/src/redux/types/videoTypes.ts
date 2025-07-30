export interface VideoRoom {
  roomId: string;
  appointmentId: string;
  expiresAt: string;
}

export interface VideoLog {
  logId:       string
  appointmentId: string
  roomId:        string
  userId:        string
  role:          'patient' | 'doctor' | 'admin'
  joinedAt:      string
  leftAt?:       string
  durationMin?:  number
}

export interface VideoState {
  room:    VideoRoom | null
  logs:    VideoLog[]
  loading: boolean
  error:   string | null
}