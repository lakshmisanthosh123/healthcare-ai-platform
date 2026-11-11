import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Enter a valid email address")
    .nonempty("Email is required"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
