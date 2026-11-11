export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName?: string;
  notes?: string;
  date: string; // ISO date
  time?: string; // e.g. "09:30"
  reason?: string;
  status?: "scheduled" | "completed" | "cancelled";
  createdAt?: string;
  updatedAt?: string;
}
