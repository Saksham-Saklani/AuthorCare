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

export type CreateTicketInput = z.infer<typeof createTicketSchema>;