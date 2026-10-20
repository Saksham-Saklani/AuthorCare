import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import api from "../../services/api";
import ReplyComposer from "./ReplyComposer";
import UpdateTicket from "./UpdateTicket";
import socket from "../../lib/socket";

type TicketCategory =
  | "ROYALTY_PAYMENTS"
  | "ISBN_METADATA_ISSUES"
  | "PRINTING_QUALITY"
  | "DISTRIBUTION_AVAILABILITY"
  | "BOOK_STATUS_PRODUCTION"
  | "GENERAL_INQUIRY";

interface AdminUser {
  id?: string;
  name: string;
  email: string;
}

interface Book {
  id: string;
  title: string;
  isbn: string;
}

interface TicketMessage {
  id: string;
  body: string;
  visibility: "PUBLIC" | "INTERNAL";
  senderId: string;
  createdAt: string;
}

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  category: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  aiProcessed: boolean;
  authorId: string;
  bookId: string | null;
  assignedToId: string | null;
  createdAt: string;
  updatedAt: string;
  author: AdminUser;
  book: Book | null;
  messages: TicketMessage[];
}

export default function AdminTicketDetails() {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshTicket = async () => {
    if (!ticketId) return;

    try {
      const response = await api.get(`/tickets/admin/${ticketId}`);
      setTicket(response.data.data.ticket);
    } catch (err) {
      console.error("[AdminTicketDetails] Failed to refresh ticket:", err);
    }
  };

  useEffect(() => {
    if (!ticketId) {
      setError("Ticket ID is missing.");
      setLoading(false);
      return;
    }

    const fetchTicket = async () => {
      try {
        setError("");

        const response = await api.get(`/tickets/admin/${ticketId}`);

        setTicket(response.data.data.ticket);
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message
          : undefined;

        setError(
          typeof message === "string"
            ? message
            : "Unable to load ticket details.",
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchTicket();
  }, [ticketId]);

  useEffect(() => {
    if (!ticketId) return;

    const handleTicketUpdated = (data: { ticketId: string }) => {
      if (data.ticketId === ticketId) {
        void refreshTicket();
      }
    };

    const subscribe = () => {
      socket.emit("ticket:subscribe", ticketId);
    };

    if (socket.connected) {
      subscribe();
    }

    socket.on("connect", subscribe);
    socket.on("reconnect", subscribe);
    socket.on("ticket:updated", handleTicketUpdated);

    return () => {
      socket.off("connect", subscribe);
      socket.off("reconnect", subscribe);
      socket.off("ticket:updated", handleTicketUpdated);
    };
  }, [ticketId]);

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }).format(new Date(date));

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
        <LoaderCircle className="animate-spin" size={20} />
        Loading ticket...
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div>
        <button
          onClick={() => navigate("/admin/tickets")}
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600"
        >
          <ArrowLeft size={16} />
          Back to tickets
        </button>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error || "Ticket not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <button
        onClick={() => navigate("/admin/tickets")}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600"
      >
        <ArrowLeft size={16} />
        Back to ticket queue
      </button>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
              Support Ticket
            </p>

            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              {ticket.subject}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Created {formatDate(ticket.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              {ticket.status.replaceAll("_", " ")}
            </span>

            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
              {ticket.priority}
            </span>
          </div>
        </div>

        <div className="mt-8 grid gap-6 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <section>
            <h2 className="text-sm font-semibold text-slate-900">
              Author Information
            </h2>

            <p className="mt-3 text-sm text-slate-700">{ticket.author.name}</p>

            <p className="mt-1 text-sm text-slate-500">{ticket.author.email}</p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-900">
              Related Book
            </h2>

            {ticket.book ? (
              <>
                <p className="mt-3 text-sm text-slate-700">
                  {ticket.book.title}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  ISBN: {ticket.book.isbn}
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                General inquiry — no book linked.
              </p>
            )}
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-900">Category</h2>

            <p className="mt-3 text-sm text-slate-700">
              {ticket.category.replaceAll("_", " ")}
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-900">Assigned</h2>

            <p className="mt-3 text-sm text-slate-700">
              {ticket.assignedToId ? "Yes" : "No"}
            </p>
          </section>
        </div>

        <section className="mt-8 border-t border-slate-100 pt-6">
          <h2 className="text-sm font-semibold text-slate-900">
            Ticket Description
          </h2>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {ticket.description}
          </p>
        </section>

        <UpdateTicket
          ticketId={ticket.id}
          status={ticket.status}
          priority={ticket.priority}
          category={ticket.category as TicketCategory}
          onUpdated={refreshTicket}
        />

        <section className="mt-8 border-t border-slate-100 pt-6">
          <h2 className="text-sm font-semibold text-slate-900">
            Conversation & Internal Notes
          </h2>

          {ticket.messages.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No messages yet.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {ticket.messages.map((message) => {
                const isAuthor = message.senderId === ticket.authorId;
                const isInternal = message.visibility === "INTERNAL";

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isAuthor ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl border px-4 py-3 ${
                        isInternal
                          ? "border-amber-200 bg-amber-50"
                          : isAuthor
                            ? "border-slate-200 bg-white"
                            : "border-indigo-100 bg-indigo-50"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-800">
                          {isAuthor ? ticket.author.name : "Support Admin"}
                        </p>

                        <span className="text-xs text-slate-500">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>

                      {isInternal && (
                        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
                          Internal note
                        </p>
                      )}

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                        {message.body}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
      <ReplyComposer ticketId={ticket.id} onMessageSent={refreshTicket} />
    </div>
  );
}
