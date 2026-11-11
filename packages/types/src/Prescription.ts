export interface Prescription {
  id: string;
  doctorId: string;
  patientId: string;
  //medications: Medication[];
  instructions?: string;
  notes?: string;
  createdAt: string;
  status?: "active" | "expired" | "completed";
}
