import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import api from "../../services/api";
import type { Ticket } from "../../types";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
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

const categories = [
  "ROYALTY_PAYMENTS",
  "ISBN_METADATA_ISSUES",
  "PRINTING_QUALITY",
  "DISTRIBUTION_AVAILABILITY",
  "BOOK_STATUS_PRODUCTION",
  "GENERAL_INQUIRY",
];

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

export default function AdminTickets() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const [searchParams, setSearchParams] = useSearchParams();

  const status = searchParams.get("status") ?? "";
  const category = searchParams.get("category") ?? "";
  const priority = searchParams.get("priority") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const updateFilter = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      next.delete("page");
      return next;
    });
  };

  const setPage = (nextPage: number | ((current: number) => number)) => {
    const computed = typeof nextPage === "function" ? nextPage(page) : nextPage;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (computed > 1) {
        next.set("page", String(computed));
      } else {
        next.delete("page");
      }
      return next;
    });
  };

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/tickets/admin/all", {
          params: {
            ...(status && { status }),
            ...(category && { category }),
            ...(priority && { priority }),
            page,
            limit: 20,
          },
        });

        setTickets(response.data.data);
        setPagination(response.data.pagination);
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message
          : undefined;

        setError(
          typeof message === "string"
            ? message
            : "Unable to load tickets. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchTickets();
  }, [status, category, priority, page]);

  const resetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-medium text-indigo-600">Admin Portal</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Support Tickets
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Review and manage author support requests.
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-500" />
          <h2 className="font-semibold">Filters</h2>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-medium text-slate-600"
            >
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(event) => updateFilter("status", event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
            >
              <option value="">Select</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-medium text-slate-600"
            >
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(event) => updateFilter("category", event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
            >
              <option value="">Select</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {formatLabel(item)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="priority"
              className="mb-2 block text-sm font-medium text-slate-600"
            >
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(event) => updateFilter("priority", event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
            >
              <option value="">Select</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="font-semibold">All Tickets</h2>
            <p className="mt-1 text-sm text-slate-500">
              {pagination.total} total tickets
            </p>
          </div>
        </div>

        {error ? (
          <div className="m-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : loading ? (
          <p className="p-8 text-sm text-slate-500">Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <p className="p-8 text-sm text-slate-500">
            No tickets match the selected filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Ticket</th>
                  <th className="px-6 py-4 font-medium">Author</th>
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
                    onClick={() => navigate(`/admin/tickets/${ticket.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        navigate(`/admin/tickets/${ticket.id}`);
                      }
                    }}
                    tabIndex={0}
                    role="link"
                    aria-label={`Open ticket: ${ticket.subject}`}
                    className="cursor-pointer hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-600"
                  >
                    <td className="max-w-xs px-6 py-4">
                      <p className="font-medium text-slate-900">
                        {ticket.subject}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {ticket.book?.title ?? "General Inquiry"}
                      </p>
                    </td>

                    <td className="min-w-48 px-6 py-4">
                      <p className="font-medium text-slate-800">
                        {ticket.author.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {ticket.author.email}
                      </p>
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

        {!error && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
            <p className="text-sm text-slate-500">
              Page {pagination.page} of {pagination.totalPages}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => current - 1)}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <button
                onClick={() => setPage((current) => current + 1)}
                disabled={page >= pagination.totalPages || loading}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}