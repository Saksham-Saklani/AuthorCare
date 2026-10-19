import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import api from "../../services/api";

interface Book {
  id: string;
  title: string;
  isbn: string;
}

export default function TicketForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const selectedBookId = searchParams.get("bookId");

  const [books, setBooks] = useState<Book[]>([]);
  const [bookId, setBookId] = useState(selectedBookId ?? "");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const [loadingBooks, setLoadingBooks] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await api.get("/books");
        const authorBooks: Book[] = response.data.data.books;

        setBooks(authorBooks);

        // Keep the preselected book only if it belongs to this author.
        if (
          selectedBookId &&
          !authorBooks.some((book) => book.id === selectedBookId)
        ) {
          setBookId("");
        }
      } catch {
        setError("Unable to load your books. You can still submit a general inquiry.");
      } finally {
        setLoadingBooks(false);
      }
    };

    void fetchBooks();
  }, [selectedBookId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await api.post("/tickets", {
        subject: subject.trim(),
        description: description.trim(),
        bookId: bookId || null,
      });

      const createdTicket = response.data.data.ticket;

      navigate(`/author/tickets/${createdTicket.id}`, { replace: true });
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message
        : undefined;

      setError(
        typeof message === "string"
          ? message
          : "Unable to create your ticket. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link
        to="/author/tickets"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600"
      >
        <ArrowLeft size={16} />
        Back to My Tickets
      </Link>

      <section>
        <p className="text-sm font-medium text-indigo-600">Author Portal</p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Create Support Ticket
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Describe your issue and BookLeaf support will assist you.
        </p>
      </section>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 sm:p-8"
      >
        <div>
          <label
            htmlFor="bookId"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Related Book <span className="text-slate-400">(optional)</span>
          </label>

          <select
            id="bookId"
            value={bookId}
            onChange={(event) => setBookId(event.target.value)}
            disabled={loadingBooks || submitting}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
          >
            <option value="">General Inquiry / Account Level</option>

            {books.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title} — {book.isbn}
              </option>
            ))}
          </select>

          <p className="mt-2 text-xs text-slate-500">
            Select a book if your issue relates to a specific title.
          </p>
        </div>

        <div>
          <label
            htmlFor="subject"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Subject
          </label>

          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Briefly describe your issue"
            minLength={3}
            maxLength={150}
            required
            disabled={submitting}
            className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
          />

          <p className="mt-2 text-xs text-slate-500">
            {subject.length}/150 characters
          </p>
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Description
          </label>

          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Explain your issue in detail..."
            rows={6}
            minLength={10}
            maxLength={5000}
            required
            disabled={submitting}
            className="w-full resize-y rounded-lg border border-slate-300 px-3 py-3 text-sm leading-6 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
          />

          <p className="mt-2 text-xs text-slate-500">
            {description.length}/5000 characters
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate("/author/tickets")}
            disabled={submitting}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              submitting ||
              loadingBooks ||
              subject.trim().length < 3 ||
              description.trim().length < 10
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={16} />
            {submitting ? "Submitting..." : "Submit Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}