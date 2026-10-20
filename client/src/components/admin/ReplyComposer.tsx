import { useState } from "react";
import axios from "axios";
import { Sparkles, Send, Lock, MessageSquare } from "lucide-react";
import api from "../../services/api";

interface ReplyComposerProps {
  ticketId: string;
  onMessageSent: () => Promise<void>;
}

export default function ReplyComposer({
  ticketId,
  onMessageSent,
}: ReplyComposerProps) {
  const [mode, setMode] = useState<"REPLY" | "INTERNAL">("REPLY");
  const [body, setBody] = useState("");
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleGenerateDraft = async () => {
    setGenerating(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post(
        `/tickets/admin/${ticketId}/ai-draft`,
      );

      const draft = response.data.data?.draft;

      if (typeof draft !== "string" || !draft.trim()) {
        throw new Error("No draft was returned by the AI service.");
      }

      setMode("REPLY");
      setBody(draft);
      setSuccess("AI draft generated. Review it before sending.");
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message
        : err instanceof Error
          ? err.message
          : undefined;

      setError(
        typeof message === "string"
          ? message
          : "Unable to generate an AI draft.",
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleSend = async () => {
    const trimmedBody = body.trim();

    if (!trimmedBody || sending) return;

    setSending(true);
    setError("");
    setSuccess("");

    try {
      await api.post(`/tickets/admin/${ticketId}/messages`, {
        body: trimmedBody,
        visibility: mode === "INTERNAL" ? "INTERNAL" : "PUBLIC",
      });

      setBody("");
      setSuccess(
        mode === "INTERNAL"
          ? "Internal note saved."
          : "Reply sent to the author.",
      );

      await onMessageSent();
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message
        : undefined;

      setError(
        typeof message === "string"
          ? message
          : "Unable to send your message.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Reply & Notes
        </h2>

        {mode === "REPLY" && (
          <button
            type="button"
            onClick={handleGenerateDraft}
            disabled={generating || sending}
            className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles size={16} />
            {generating ? "Generating..." : "Generate AI Draft"}
          </button>
        )}
      </div>

      <div className="mt-5 flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => {
            setMode("REPLY");
            setError("");
            setSuccess("");
          }}
          className={`inline-flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium ${
            mode === "REPLY"
              ? "border-indigo-600 text-indigo-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <MessageSquare size={16} />
          Reply to Author
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("INTERNAL");
            setError("");
            setSuccess("");
          }}
          className={`inline-flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium ${
            mode === "INTERNAL"
              ? "border-amber-500 text-amber-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Lock size={16} />
          Internal Note
        </button>
      </div>

      {mode === "INTERNAL" && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Internal notes are visible only to administrators, not the author.
        </div>
      )}

      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={6}
        placeholder={
          mode === "REPLY"
            ? "Write your reply or generate an AI draft..."
            : "Write an internal note..."
        }
        className="mt-4 w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-sm leading-6 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {success && (
        <p className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {success}
        </p>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || generating || !body.trim()}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
            mode === "INTERNAL"
              ? "bg-amber-600 hover:bg-amber-700"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {mode === "INTERNAL" ? <Lock size={16} /> : <Send size={16} />}
          {sending
            ? "Saving..."
            : mode === "INTERNAL"
              ? "Save Internal Note"
              : "Send Reply"}
        </button>
      </div>
    </section>
  );
}