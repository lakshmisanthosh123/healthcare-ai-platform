import { z } from "zod";

export const patientSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .nonempty("First name is required"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .nonempty("Last name is required"),
  email: z
    .string()
    .email("Enter a valid email address")
    .nonempty("Email is required"),
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .nonempty("Phone is required"),
  dateOfBirth: z.string().nonempty("Date of birth is required"),
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"]).optional(),
  bloodType: z.string().optional(),
  address: z.string().optional(),
  medicalHistory: z.string().optional(),
});

export type PatientFormValues = z.infer<typeof patientSchema>;
