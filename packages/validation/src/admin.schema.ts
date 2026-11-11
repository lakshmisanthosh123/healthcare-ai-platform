import { z } from "zod";

export const adminSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .nonempty("Username is required"),
  email: z
    .string()
    .email("Enter a valid email address")
    .nonempty("Email is required"),
  role: z.string().nonempty("Role is required"),
  isActive: z.boolean(),
});

export type AdminFormValues = z.infer<typeof adminSchema>;
