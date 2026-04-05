import z from "zod";

// Login DTO
export const loginUserDto = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address")
    .transform((val) => val.toLowerCase()),

  password: z.string().min(1, "Password is required"),
});

// Refresh Token DTO
export const refreshTokenDto = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});
