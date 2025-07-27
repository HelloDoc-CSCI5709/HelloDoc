export type AppointmentType = {
  _id: string;
  scheduledFor: string;
  doctorId: { fullName: string; _id: string };
  patientId: { fullName: string; _id: string };
};

export type MessageType = {
  _id: string;
  senderId: string;
  senderRole: "doctor" | "patient";
  message: string;
  timestamp: string;
};
