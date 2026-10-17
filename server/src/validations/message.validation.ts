import { z } from "zod";

export const createMessageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(5000, "Message cannot exceed 5000 characters"),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;