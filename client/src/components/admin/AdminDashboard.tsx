import { useEffect, useState } from "react";
import axios from "axios";
import { Ticket, Clock, CircleAlert, CheckCircle2 } from "lucide-react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

type TicketFilter = Record<string, string>;



interface TicketItem {
  id: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
}

interface DashboardStats {
  total: number;
  open: number;
  inProgress: number;
  critical: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    critical: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setError("");

        const response = await api.get("/tickets/admin/all", {
          params: { page: 1, limit: 100 },
        });

        const tickets = response.data.data as TicketItem[];

        setStats({
          total: response.data.pagination.total,
          open: tickets.filter((ticket) => ticket.status === "OPEN").length,
          inProgress: tickets.filter(
            (ticket) => ticket.status === "IN_PROGRESS",
          ).length,
          critical: tickets.filter(
            (ticket) => ticket.priority === "CRITICAL",
          ).length,
        });
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message
          : undefined;

        setError(
          typeof message === "string"
            ? message
            : "Unable to load dashboard statistics.",
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchDashboardStats();
  }, []);

const cards: {
  label: string;
  value: number;
  icon: typeof Ticket;
  description: string;
  filter: TicketFilter;
}[] = [
  {
    label: "Total Tickets",
    value: stats.total,
    icon: Ticket,
    description: "All support tickets",
    filter: {},
  },
  {
    label: "Open Tickets",
    value: stats.open,
    icon: Clock,
    description: "Awaiting resolution",
    filter: { status: "OPEN" },
  },
  {
    label: "In Progress",
    value: stats.inProgress,
    icon: CheckCircle2,
    description: "Currently being handled",
    filter: { status: "IN_PROGRESS" },
  },
  {
    label: "Critical Priority",
    value: stats.critical,
    icon: CircleAlert,
    description: "Require urgent attention",
    filter: { priority: "CRITICAL" },
  },
];
  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of AuthorCare support operations.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              onClick={() => {
  const query = new URLSearchParams(card.filter).toString();
  navigate(`/admin/tickets${query ? `?${query}` : ""}`);
}}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {card.label}
                </p>
                <Icon size={20} className="text-indigo-600" />
              </div>

              <p className="mt-4 text-3xl font-bold text-slate-900">
                {loading ? "—" : card.value}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}