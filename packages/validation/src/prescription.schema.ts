import { z } from "zod";

export const medicationSchema = z.object({
  name: z
    .string()
    .min(2, "Medication name is required")
    .nonempty("Medication name is required"),
  dosage: z
    .string()
    .min(1, "Dosage is required")
    .nonempty("Dosage is required"),
  frequency: z.string().nonempty("Frequency is required"),
  duration: z
    .string()
    .min(1, "Duration is required")
    .nonempty("Duration is required"),
  notes: z.string().optional(),
});

export const prescriptionSchema = z.object({
  medications: z.array(medicationSchema).min(1, "Add at least one medication"),
  instructions: z.string().optional(),
  notes: z.string().optional(),
});

export type MedicationFormValues = z.infer<typeof medicationSchema>;
export type PrescriptionFormValues = z.infer<typeof prescriptionSchema>;
