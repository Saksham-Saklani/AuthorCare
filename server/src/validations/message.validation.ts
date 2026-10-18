import { z } from "zod";

export const createMessageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(5000, "Message cannot exceed 5000 characters"),
});

export const adminMessageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(5000, "Message cannot exceed 5000 characters"),
  visibility: z.enum(["PUBLIC", "INTERNAL"]),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type AdminMessageInput = z.infer<typeof adminMessageSchema>;