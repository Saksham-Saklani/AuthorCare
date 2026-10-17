import { ai } from "../lib/gemini.js";
import type {
  TicketCategory,
  TicketPriority,
} from "../generated/prisma/client.js";
import { z } from "zod";

const categories = [
  "ROYALTY_PAYMENTS",
  "ISBN_METADATA_ISSUES",
  "PRINTING_QUALITY",
  "DISTRIBUTION_AVAILABILITY",
  "BOOK_STATUS_PRODUCTION",
  "GENERAL_INQUIRY",
] as const;

const priorities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;

// Schema used to validate Gemini's response.
const resultSchema = z.object({
  category: z.enum(categories),
  priority: z.enum(priorities),
});

// JSON Schema used by Gemini for structured output.
const classificationJsonSchema = {
  type: "object",
  properties: {
    category: {
      type: "string",
      enum: [...categories],
      description: "The category that best matches the ticket.",
    },
    priority: {
      type: "string",
      enum: [...priorities],
      description: "The urgency level of the ticket.",
    },
  },
  required: ["category", "priority"],
  additionalProperties: false,
};

export const classifyTicket = async (
  subject: string,
  description: string,
): Promise<{ category: TicketCategory; priority: TicketPriority }> => {
  const interaction = await ai.interactions.create({
    model: "gemini-3.8-flash",

    input: `
You classify support tickets for a book publishing support platform.

Choose the category that best matches the author's actual issue.

CATEGORY GUIDELINES:
- ROYALTY_PAYMENTS: Royalties, earnings, royalty calculations, or payouts.
- ISBN_METADATA_ISSUES: ISBN errors or incorrect book metadata.
- PRINTING_QUALITY: Printing defects, damaged books, or print quality issues.
- DISTRIBUTION_AVAILABILITY: Distribution problems, missing listings, or book availability.
- BOOK_STATUS_PRODUCTION: Production progress, publishing stages, or book status.
- GENERAL_INQUIRY: Questions that do not fit another category.

PRIORITY GUIDELINES:
- CRITICAL: Severe issues requiring immediate attention.
- HIGH: Significant issues requiring prompt attention.
- MEDIUM: Normal support requests.
- LOW: Minor issues or informational questions.

Classify based on the actual issue and its impact.

Ticket subject: ${subject}

Ticket description: ${description}
`,

    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: classificationJsonSchema,
    },
  });

  const output = interaction.output_text;

  if (!output) {
    throw new Error("AI_CLASSIFICATION_FAILED");
  }

  let result: z.infer<typeof resultSchema>;

  try {
    result = resultSchema.parse(JSON.parse(output));
  } catch {
    throw new Error("AI_CLASSIFICATION_INVALID_OUTPUT");
  }

  return {
    category: result.category,
    priority: result.priority,
  };
};