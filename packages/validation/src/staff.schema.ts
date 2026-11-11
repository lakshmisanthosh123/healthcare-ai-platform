import { z } from "zod";

const staffFields = {
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters"),
  lastName: z.string().trim().min(2, "Last name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().min(10, "Enter a valid phone number"),
  jobTitle: z.string().trim().min(2, "Job title is required"),
  department: z.string().trim().min(2, "Department is required"),
  employmentStatus: z.enum(["active", "inactive", "on_leave"]),
  employeeId: z.string().trim().optional(),
  hireDate: z.string().optional(),
};

export const staffSchema = z.object(staffFields);

export const staffProfileSchema = z.object({
  firstName: staffFields.firstName,
  lastName: staffFields.lastName,
  email: staffFields.email,
  phone: staffFields.phone,
  jobTitle: staffFields.jobTitle,
  department: staffFields.department,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type StaffFormValues = z.infer<typeof staffSchema>;
export type StaffProfileFormValues = z.infer<typeof staffProfileSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
