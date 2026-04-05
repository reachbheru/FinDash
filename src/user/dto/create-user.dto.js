import z from "zod";
import { userRole, userStatus } from "../../common/enum.js";

export const createUserDto = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters long")
      .max(50, "Name must not exceed 50 characters")
      .trim()
      .refine(
        (name) => /^[a-zA-Z\s]+$/.test(name),
        "Name can only contain letters and spaces",
      ),

    email: z
      .string()
      .min(1, "Email is required")
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address")
      .toLowerCase()
      .refine(
        (email) => !email.endsWith(".test"),
        "Test emails are not allowed",
      ),

    password: z
      .string()
      .min(1, "Password is required")
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
      ),

    confirmPassword: z.string().min(1, "Please confirm your password"),

    role: z
      .enum(Object.values(userRole))
      .default(userRole.viewer)
      .describe("User role"),

    status: z
      .enum(Object.values(userStatus))
      .default(userStatus.active)
      .describe("User status"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // This sets which field the error appears on
  });
