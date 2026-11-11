import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Enter a valid email address")
    .nonempty("Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .nonempty("Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
