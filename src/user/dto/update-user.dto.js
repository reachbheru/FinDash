import z from "zod";
import { userRole, userStatus } from "../../common/enum.js";

// User can update their own profile (name, email, password only)
export const updateUserProfileDto = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters long")
      .max(50, "Name must not exceed 50 characters")
      .trim()
      .refine(
        (name) => /^[a-zA-Z\s]+$/.test(name),
        "Name can only contain letters and spaces",
      )
      .optional(),

    email: z
      .string()
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address")
      .toLowerCase()
      .refine(
        (email) => !email.endsWith(".test"),
        "Test emails are not allowed",
      )
      .optional(),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(128, "Password must not exceed 128 characters")
      .refine(
        (password) => /[A-Z]/.test(password),
        "Password must contain at least one uppercase letter",
      )
      .refine(
        (password) => /[a-z]/.test(password),
        "Password must contain at least one lowercase letter",
      )
      .refine(
        (password) => /[0-9]/.test(password),
        "Password must contain at least one number",
      )
      .refine(
        (password) => /[!@#$%^&*]/.test(password),
        "Password must contain at least one special character (!@#$%^&*)",
      )
      .optional(),

    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // If password is being updated, require confirmation
      if (data.password && !data.confirmPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Password confirmation is required when updating password",
      path: ["confirmPassword"],
    },
  )
  .refine(
    (data) => {
      // If both password and confirmPassword are provided, they must match
      if (data.password && data.confirmPassword) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    },
  );

// Admin can update user role and status
export const updateUserAdminDto = z.object({
  role: z.enum(Object.values(userRole)).optional(),
  status: z.enum(Object.values(userStatus)).optional(),
});

// Full update DTO (kept for backward compatibility)
export const updateUserDto = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters long")
      .max(50, "Name must not exceed 50 characters")
      .trim()
      .refine(
        (name) => /^[a-zA-Z\s]+$/.test(name),
        "Name can only contain letters and spaces",
      )
      .optional(),

    email: z
      .string()
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address")
      .toLowerCase()
      .refine(
        (email) => !email.endsWith(".test"),
        "Test emails are not allowed",
      )
      .optional(),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(128, "Password must not exceed 128 characters")
      .refine(
        (password) => /[A-Z]/.test(password),
        "Password must contain at least one uppercase letter",
      )
      .refine(
        (password) => /[a-z]/.test(password),
        "Password must contain at least one lowercase letter",
      )
      .refine(
        (password) => /[0-9]/.test(password),
        "Password must contain at least one number",
      )
      .refine(
        (password) => /[!@#$%^&*]/.test(password),
        "Password must contain at least one special character (!@#$%^&*)",
      )
      .optional(),

    confirmPassword: z.string().optional(),

    role: z.enum(Object.values(userRole)).optional(),

    status: z.enum(Object.values(userStatus)).optional(),
  })
  .refine(
    (data) => {
      // If password is being updated, require confirmation
      if (data.password && !data.confirmPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Password confirmation is required when updating password",
      path: ["confirmPassword"],
    },
  )
  .refine(
    (data) => {
      // If both password and confirmPassword are provided, they must match
      if (data.password && data.confirmPassword) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    },
  );

// Strict update DTO (kept for backward compatibility)
export const updateUserStrictDto = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name must not exceed 50 characters")
    .trim()
    .optional(),

  status: z.enum(Object.values(userStatus)).optional().describe("User status"),
});
