import { useState } from "react";
import axios from "axios";
import { Check, UserRoundCheck } from "lucide-react";
import api from "../../services/api";

type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

type TicketPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

type TicketCategory =
  | "ROYALTY_PAYMENTS"
  | "ISBN_METADATA_ISSUES"
  | "PRINTING_QUALITY"
  | "DISTRIBUTION_AVAILABILITY"
  | "BOOK_STATUS_PRODUCTION"
  | "GENERAL_INQUIRY";

interface AdminTicketControlsProps {
  ticketId: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  onUpdated: () => Promise<void>;
}

const statuses: TicketStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

const priorities: TicketPriority[] = [
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
];

const categories: { value: TicketCategory; label: string }[] = [
  { value: "ROYALTY_PAYMENTS", label: "Royalty & Payments" },
  { value: "ISBN_METADATA_ISSUES", label: "ISBN & Metadata Issues" },
  { value: "PRINTING_QUALITY", label: "Printing & Quality" },
  {
    value: "DISTRIBUTION_AVAILABILITY",
    label: "Distribution & Availability",
  },
  {
    value: "BOOK_STATUS_PRODUCTION",
    label: "Book Status & Production",
  },
  { value: "GENERAL_INQUIRY", label: "General Inquiry" },
];

export default function UpdateTicket({
  ticketId,
  status,
  priority,
  category,
  onUpdated,
}: AdminTicketControlsProps) {
  const [newStatus, setNewStatus] = useState(status);
  const [newPriority, setNewPriority] = useState(priority);
  const [newCategory, setNewCategory] = useState(category);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const hasChanges =
    newStatus !== status ||
    newPriority !== priority ||
    newCategory !== category;

  const handleSave = async () => {
    if (!hasChanges || saving) return;

    const updates: {
      status?: TicketStatus;
      priority?: TicketPriority;
      category?: TicketCategory;
    } = {};

    if (newStatus !== status) updates.status = newStatus;
    if (newPriority !== priority) updates.priority = newPriority;
    if (newCategory !== category) updates.category = newCategory;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await api.patch(`/tickets/admin/${ticketId}`, updates);
      await onUpdated();
      setSuccess("Ticket updated successfully.");
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message
        : undefined;

      setError(
        typeof message === "string"
          ? message
          : "Unable to update the ticket.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAssignToMe = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await api.patch(`/tickets/admin/${ticketId}/assign`);
      await onUpdated();
      setSuccess("Ticket assigned successfully.");
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message
        : undefined;

      setError(
        typeof message === "string"
          ? message
          : "Unable to assign the ticket.",
      );
    } finally {
      setSaving(false);
    }
  };

  const selectClass =
    "mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Ticket Management
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Update classification, priority, and status.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAssignToMe}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 px-4 py-2.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
        >
          <UserRoundCheck size={16} />
          Assign to Me
        </button>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <label className="text-sm font-medium text-slate-700">
          Status
          <select
            value={newStatus}
            onChange={(event) =>
              setNewStatus(event.target.value as TicketStatus)
            }
            className={selectClass}
          >
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          Classification
          <select
            value={newCategory}
            onChange={(event) =>
              setNewCategory(event.target.value as TicketCategory)
            }
            className={selectClass}
          >
            {categories.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          Priority
          <select
            value={newPriority}
            onChange={(event) =>
              setNewPriority(event.target.value as TicketPriority)
            }
            className={selectClass}
          >
            {priorities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {success && (
        <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {success}
        </p>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Check size={16} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </section>
  );
}