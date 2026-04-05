import z from "zod";
import { transactionType, transactionCategory } from "../../common/enum.js";

// Create Transaction DTO
export const createTransactionDto = z.object({
  amount: z
    .number()
    .positive("Amount must be greater than 0")
    .max(999999999, "Amount exceeds maximum limit"),

  type: z.enum(Object.values(transactionType), {
    errorMap: () => ({
      message: `Type must be one of: ${Object.values(transactionType).join(", ")}`,
    }),
  }),

  category: z.enum(Object.values(transactionCategory), {
    errorMap: () => ({
      message: `Category must be one of: ${Object.values(transactionCategory).join(", ")}`,
    }),
  }),

  date: z
    .string()
    .datetime()
    .transform((str) => new Date(str)),

  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .trim()
    .optional(),

  tags: z
    .array(z.string().trim())
    .max(10, "Maximum 10 tags allowed")
    .optional(),
});

// Update Transaction DTO
export const updateTransactionDto = z.object({
  amount: z
    .number()
    .positive("Amount must be greater than 0")
    .max(999999999, "Amount exceeds maximum limit")
    .optional(),

  type: z
    .enum(Object.values(transactionType), {
      errorMap: () => ({
        message: `Type must be one of: ${Object.values(transactionType).join(", ")}`,
      }),
    })
    .optional(),

  category: z
    .enum(Object.values(transactionCategory), {
      errorMap: () => ({
        message: `Category must be one of: ${Object.values(transactionCategory).join(", ")}`,
      }),
    })
    .optional(),

  date: z
    .string()
    .datetime()
    .transform((str) => new Date(str))
    .optional(),

  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .trim()
    .optional(),

  tags: z
    .array(z.string().trim())
    .max(10, "Maximum 10 tags allowed")
    .optional(),
});

// Delete Transaction DTO
export const deleteTransactionDto = z.object({
  transactionId: z.string().refine((id) => id.match(/^[0-9a-fA-F]{24}$/), {
    message: "Invalid transaction ID",
  }),
});

// Bulk Delete Transactions DTO
export const bulkDeleteTransactionsDto = z.object({
  transactionIds: z
    .array(
      z.string().refine((id) => id.match(/^[0-9a-fA-F]{24}$/), {
        message: "Invalid transaction ID format",
      }),
    )
    .min(1, "At least one transaction ID is required")
    .max(100, "Maximum 100 transactions can be deleted at once"),
});
