import { z } from "zod";

export const otpSchema = z.object({
  code: z
    .string()
    .min(6, "OTP must be at least 6 characters")
    .nonempty("OTP is required"),
});

export type OtpFormValues = z.infer<typeof otpSchema>;
