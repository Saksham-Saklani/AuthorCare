import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Plus, Ticket as TicketIcon } from "lucide-react";
import api from "../../services/api";

interface Ticket {
  id: string;
  subject: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  category: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  createdAt: string;
  book: {
    id: string;
    title: string;
    isbn: string;
  } | null;
}

const statusStyles: Record<Ticket["status"], string> = {
  OPEN: "bg-blue-50 text-blue-700",
  IN_PROGRESS: "bg-amber-50 text-amber-700",
  RESOLVED: "bg-green-50 text-green-700",
  CLOSED: "bg-slate-100 text-slate-600",
};

const priorityStyles: Record<Ticket["priority"], string> = {
  CRITICAL: "bg-red-100 text-red-700",
  HIGH: "bg-orange-50 text-orange-700",
  MEDIUM: "bg-yellow-50 text-yellow-700",
  LOW: "bg-slate-100 text-slate-600",
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

export default function AuthorTickets() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await api.get("/tickets");
        setTickets(response.data.data.tickets);
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message
          : undefined;

        setError(
          typeof message === "string"
            ? message
            : "Unable to load your tickets. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchTickets();
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading your tickets...</p>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-600">Author Portal</p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            My Tickets
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Track your support requests and responses from BookLeaf.
          </p>
        </div>

        <button
          onClick={() => navigate("/author/tickets/new")}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          <Plus size={16} />
          Create Ticket
        </button>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold">Support Requests</h2>

          <p className="mt-1 text-sm text-slate-500">
            {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"} found
          </p>
        </div>

        {tickets.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <TicketIcon size={32} className="text-slate-400" />

            <h3 className="mt-4 font-medium text-slate-900">
              No support tickets yet
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Create a ticket if you need assistance with your books.
            </p>

            <button
              onClick={() => navigate("/author/tickets/new")}
              className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Create your first ticket
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Subject</th>
                  <th className="px-6 py-4 font-medium">Book</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Priority</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="whitespace-nowrap px-6 py-4 font-medium">
                    Created
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => navigate(`/author/tickets/${ticket.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        navigate(`/author/tickets/${ticket.id}`);
                      }
                    }}
                    tabIndex={0}
                    role="link"
                    aria-label={`View ticket: ${ticket.subject}`}
                    className="cursor-pointer hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-600"
                  >
                    <td className="max-w-xs px-6 py-4">
                      <p className="font-medium text-slate-900">
                        {ticket.subject}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {ticket.id.slice(0, 8)}
                      </p>
                    </td>

                    <td className="min-w-48 px-6 py-4 text-slate-600">
                      {ticket.book?.title ?? "General Inquiry"}
                    </td>

                    <td className="min-w-40 px-6 py-4 text-slate-600">
                      {formatLabel(ticket.category)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${priorityStyles[ticket.priority]}`}
                      >
                        {ticket.priority}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${statusStyles[ticket.status]}`}
                      >
                        {formatLabel(ticket.status)}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                      {formatDate(ticket.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}