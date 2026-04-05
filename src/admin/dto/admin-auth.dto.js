import z from "zod";

// Admin Register DTO - requires admin secret key
export const adminRegisterDto = z.object({
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
    .refine((email) => !email.endsWith(".test"), "Test emails are not allowed"),

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

  adminSecret: z
    .string()
    .min(1, "Admin secret key is required")
    .describe("Secret key to register as admin"),
});

// Admin Login DTO
export const adminLoginDto = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address")
    .transform((val) => val.toLowerCase()),

  password: z.string().min(1, "Password is required"),
});
