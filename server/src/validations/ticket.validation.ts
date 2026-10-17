import { z } from "zod";

export const createTicketSchema = z.object({
  bookId: z.string().uuid().nullable().optional(),

  subject: z
    .string()
    .trim()
    .min(3, "Subject must be at least 3 characters long")
    .max(150, "Subject cannot exceed 150 characters"),

  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters long")
    .max(5000, "Description cannot exceed 5000 characters"),
});

export const adminTicketQuerySchema = z
  .object({
    status: z
      .enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"])
      .optional(),

    category: z
      .enum([
        "ROYALTY_PAYMENTS",
        "ISBN_METADATA_ISSUES",
        "PRINTING_QUALITY",
        "DISTRIBUTION_AVAILABILITY",
        "BOOK_STATUS_PRODUCTION",
        "GENERAL_INQUIRY",
      ])
      .optional(),

    priority: z
      .enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"])
      .optional(),

    from: z.iso.date().optional(),

    to: z.iso.date().optional(),

    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .refine(
    (data) => !data.from || !data.to || data.from <= data.to,
    {
      message: "Invalid date range",
      path: ["from"],
    },
  );

export const updateTicketSchema = z
  .object({
    status: z
      .enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"])
      .optional(),

    priority: z
      .enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"])
      .optional(),

    category: z
      .enum([
        "ROYALTY_PAYMENTS",
        "ISBN_METADATA_ISSUES",
        "PRINTING_QUALITY",
        "DISTRIBUTION_AVAILABILITY",
        "BOOK_STATUS_PRODUCTION",
        "GENERAL_INQUIRY",
      ])
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type AdminTicketQuery = z.infer<typeof adminTicketQuerySchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;