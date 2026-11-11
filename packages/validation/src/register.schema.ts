import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z.string().optional(),
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
    gender: z.string().nonempty("Gender is required"),
    bloodType: z.string().nonempty("Blood type is required"),
    address: z
      .string()
      .min(5, "Address is required")
      .nonempty("Address is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .nonempty("Password is required"),
    confirmPassword: z.string().nonempty("Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
