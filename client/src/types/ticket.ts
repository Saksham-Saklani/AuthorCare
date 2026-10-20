import type { Book } from "./book";

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export type TicketPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type TicketCategory =
  | "ROYALTY_PAYMENTS"
  | "ISBN_METADATA_ISSUES"
  | "PRINTING_QUALITY"
  | "DISTRIBUTION_AVAILABILITY"
  | "BOOK_STATUS_PRODUCTION"
  | "GENERAL_INQUIRY";

export type MessageVisibility = "PUBLIC" | "INTERNAL";

export interface TicketMessage {
  id: string;
  body: string;
  visibility: MessageVisibility;
  senderId: string;
  ticketId?: string;
  createdAt: string;
  updatedAt?: string;
  sender?: {
    id: string;
    name: string;
    role: "AUTHOR" | "ADMIN";
  };
}

export interface TicketAuthor {
  id?: string;
  name: string;
  email: string;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  category: TicketCategory;
  priority: TicketPriority;
  aiProcessed: boolean;
  authorId: string;
  bookId: string | null;
  assignedToId: string | null;
  createdAt: string;
  updatedAt: string;
  author: TicketAuthor;
  book: (Pick<Book, "id" | "title" | "isbn">) | null;
  messages: TicketMessage[];
}
