import { z } from "zod";

export const appointmentSchema = z.object({
  doctorId: z.string().nonempty("Doctor is required"),
  patientName: z.string().optional(),
  doctorName: z.string().optional(),
  date: z.string().nonempty("Date is required"),
  time: z.string().nonempty("Time is required"),
  reason: z
    .string()
    .min(5, "Reason must be at least 5 characters")
    .nonempty("Reason is required"),
  notes: z.string().optional(),
});

export type AppointmentFormValues = z.infer<typeof appointmentSchema>;
