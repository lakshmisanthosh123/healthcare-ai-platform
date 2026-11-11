export interface MedicalRecord {
  id: string;
  date: string;
  type: string; // diagnosis, treatment, test, etc.
  description: string;
  doctorName?: string;
  notes?: string;
  attachments?: string[];
}
