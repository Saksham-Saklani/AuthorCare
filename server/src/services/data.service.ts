import type { TicketCategory } from "../generated/prisma/client.js";
import { knowledgeBase } from "../data/knowledgeBase.js";

export const getRelevantPolicies = (category: TicketCategory): string => {
  return knowledgeBase[category];
};