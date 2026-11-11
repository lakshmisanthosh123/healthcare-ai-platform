import { z } from "zod";

export const doctorSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .nonempty("First name is required"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .nonempty("Last name is required"),
  specialty: z.string().nonempty("Specialty is required"),
  email: z
    .string()
    .email("Enter a valid email address")
    .nonempty("Email is required"),
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .nonempty("Phone is required"),
  department: z.string().optional(),
  yearsOfExperience: z
    .number()
    .min(0, "Years of experience cannot be negative")
    .optional(),
  licenseNumber: z.string().optional(),
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"]).optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
  consultationFee: z
    .number()
    .min(0, "Consultation fee cannot be negative")
    .optional(),
  languages: z.array(z.string()).optional(),
  availability: z
    .array(
      z
        .object({
          day: z.enum([
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ]),
          from: z.string().regex(/^\d{2}:\d{2}$/, "Enter a valid start time"),
          to: z.string().regex(/^\d{2}:\d{2}$/, "Enter a valid end time"),
        })
        .refine((entry) => entry.from < entry.to, {
          message: "End time must be after start time",
          path: ["to"],
        }),
    )
    .optional(),
  isActive: z.boolean().optional(),
});

export type DoctorFormValues = z.infer<typeof doctorSchema>;
