import z from "zod";

// Basic delete DTO - requires user ID
export const deleteUserDto = z.object({
  userId: z
    .string()
    .min(1, "User ID is required")
    .refine(
      (id) => /^[a-f0-9]{24}$/.test(id),
      "Invalid user ID format (must be MongoDB ObjectId)",
    ),
});

// Delete DTO with password confirmation for security
export const deleteUserWithPasswordDto = z.object({
  userId: z
    .string()
    .min(1, "User ID is required")
    .refine(
      (id) => /^[a-f0-9]{24}$/.test(id),
      "Invalid user ID format (must be MongoDB ObjectId)",
    ),

  password: z.string().min(1, "Password is required for account deletion"),

  confirmDeletion: z
    .boolean()
    .refine((confirmed) => confirmed === true, "You must confirm deletion"),

  reason: z
    .string()
    .max(200, "Reason must not exceed 200 characters")
    .optional()
    .describe("Optional reason for deletion"),
});

// Soft delete DTO - for marking users as deleted without removing data
export const softDeleteUserDto = z.object({
  userId: z
    .string()
    .min(1, "User ID is required")
    .refine(
      (id) => /^[a-f0-9]{24}$/.test(id),
      "Invalid user ID format (must be MongoDB ObjectId)",
    ),

  reason: z
    .string()
    .max(200, "Reason must not exceed 200 characters")
    .optional(),

  archiveData: z
    .boolean()
    .default(true)
    .describe("Archive user data for recovery"),
});

// Bulk delete DTO - delete multiple users
export const bulkDeleteUserDto = z.object({
  userIds: z
    .array(z.string())
    .min(1, "At least one user ID is required")
    .refine(
      (ids) => ids.every((id) => /^[a-f0-9]{24}$/.test(id)),
      "All user IDs must be valid MongoDB ObjectIds",
    ),

  reason: z
    .string()
    .max(200, "Reason must not exceed 200 characters")
    .optional(),
});
