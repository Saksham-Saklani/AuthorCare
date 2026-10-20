import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import api from "../../services/api";
import socket from "../../lib/socket";
import type { Ticket } from "../../types";

const statusStyles: Record<Ticket["status"], string> = {
  OPEN: "bg-blue-50 text-blue-700",
  IN_PROGRESS: "bg-amber-50 text-amber-700",
  RESOLVED: "bg-green-50 text-green-700",
  CLOSED: "bg-slate-100 text-slate-600",
};

const formatLabel = (value: string) =>
  value
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");

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

export default function AuthorTicketDetails() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
const [sending, setSending] = useState(false);
const [replyError, setReplyError] = useState("");

  useEffect(() => {
    const fetchTicket = async () => {
      if (!ticketId) {
        setError("Ticket ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/tickets/${ticketId}`);
        setTicket(response.data.data.ticket);
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message
          : undefined;

        setError(
          typeof message === "string"
            ? message
            : "Unable to load ticket details."
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchTicket();

    const handleTicketUpdated = (data: { ticketId: string }) => {
      if (data.ticketId === ticketId) {
        void fetchTicket();
      }
    };

    socket.on("ticket:updated", handleTicketUpdated);

    return () => {
      socket.off("ticket:updated", handleTicketUpdated);
    };
  }, [ticketId]);

  useEffect(() => {
    if (!ticketId) return;

    const subscribe = () => {
      socket.emit("ticket:subscribe", ticketId);
    };

    if (socket.connected) {
      subscribe();
    }

    socket.on("connect", subscribe);

    return () => {
      socket.off("connect", subscribe);
      socket.emit("ticket:unsubscribe", ticketId);
    };
  }, [ticketId]);

  useEffect(() => {
    if (ticket?.messages?.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [ticket?.messages?.length]);

  const handleSendMessage = async (event: React.SyntheticEvent<HTMLFormElement>) => {
  event.preventDefault();

  const body = message.trim();

  if (!body || !ticketId || sending) return;

  setSending(true);
  setReplyError("");

  try {
    await api.post(`/tickets/${ticketId}/messages`, { body });

    setMessage("");

    const response = await api.get(`/tickets/${ticketId}`);
    setTicket(response.data.data.ticket);
  } catch (err) {
    const errorMessage = axios.isAxiosError(err)
      ? err.response?.data?.message
      : undefined;

    setReplyError(
      typeof errorMessage === "string"
        ? errorMessage
        : "Unable to send your message. Please try again."
    );
  } finally {
    setSending(false);
  }
};

  if (loading) {
    return (
      <p className="text-sm text-slate-500">Loading ticket details...</p>
    );
  }

  if (error || !ticket) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate("/author/tickets")}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to My Tickets
        </button>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error || "Ticket not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Link
        to="/author/tickets"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600"
      >
        <ArrowLeft size={16} />
        Back to My Tickets
      </Link>

      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">
              Support Request
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              {ticket.subject}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Ticket #{ticket.id.slice(0, 8)}
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-3 py-1.5 text-xs font-medium ${statusStyles[ticket.status]}`}
          >
            {formatLabel(ticket.status)}
          </span>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold">Ticket Information</h2>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <p className="text-sm text-slate-500">Category</p>
            <p className="mt-1 font-medium">
              {formatLabel(ticket.category)}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Priority</p>
            <p className="mt-1 font-medium">
              {ticket.priority}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Related Book</p>
            <p className="mt-1 font-medium">
              {ticket.book ? (
                <Link
                  to={`/author/books/${ticket.book.id}`}
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  {ticket.book.title}
                </Link>
              ) : (
                "General Inquiry"
              )}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Created</p>
            <p className="mt-1 font-medium">
              {formatDate(ticket.createdAt)}
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold">Conversation</h2>
          <p className="mt-1 text-sm text-slate-500">
            Messages between you and AuthorCare support.
          </p>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-xl bg-slate-100 p-4">
              <p className="mb-2 text-xs font-medium text-slate-500">
                Your original request
              </p>

              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-800">
                {ticket.description}
              </p>

              <p className="mt-3 text-xs text-slate-500">
                {formatDate(ticket.createdAt)}
              </p>
            </div>
          </div>

          {ticket.messages.map((message) => {
            const isAuthor = message.senderId === ticket.authorId;

            return (
              <div
                key={message.id}
                className={`flex ${isAuthor ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl p-4 ${
                    isAuthor
                      ? "bg-slate-100 text-slate-800"
                      : "bg-indigo-50 text-slate-800"
                  }`}
                >
                  <p className="mb-2 text-xs font-medium text-slate-500">
                    {isAuthor ? "You" : "AuthorCare Support"}
                  </p>

                  <p className="whitespace-pre-wrap text-sm leading-6">
                    {message.body}
                  </p>

                  <p className="mt-3 text-xs text-slate-500">
                    {formatDate(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </section>

{ticket.status !== "CLOSED" && (
  <section className="rounded-xl border border-slate-200 bg-white p-6">
    <h2 className="font-semibold">Reply to this ticket</h2>

    <form onSubmit={handleSendMessage} className="mt-4 space-y-3">
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Write your message to BookLeaf support..."
        rows={4}
        maxLength={5000}
        required
        disabled={sending}
        className="w-full resize-y rounded-lg border border-slate-300 p-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
      />

      {replyError && (
        <p role="alert" className="text-sm text-red-600">
          {replyError}
        </p>
      )}

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-slate-500">
          {message.length}/5000 characters
        </p>

        <button
          type="submit"
          disabled={!message.trim() || sending}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          <Send size={16} />
          {sending ? "Sending..." : "Send Reply"}
        </button>
      </div>
    </form>
  </section>
)}
    </div>
  );
}