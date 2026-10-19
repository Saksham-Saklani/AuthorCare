import { useEffect, useState } from "react";
import axios from "axios";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

interface Book {
  id: string;
  title: string;
  isbn: string;
  genre: string;
  publicationDate: string;
  status: string;
  totalCopiesSold: number;
  totalRoyaltyEarned: string | number;
}

export default function AuthorBooks() {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await api.get("/books");
        setBooks(response.data.data.books);
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message
          : undefined;

        setError(
          typeof message === "string"
            ? message
            : "Unable to load your books. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchBooks();
  }, []);

  const formatCurrency = (amount: number | string) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount));

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(new Date(date));

  if (loading) {
    return <p className="text-sm text-slate-500">Loading your books...</p>;
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
      <section>
        <p className="text-sm font-medium text-indigo-600">Author Portal</p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">My Books</h1>

        <p className="mt-2 text-sm text-slate-500">
          View your book details, publication status, and royalty earnings.
        </p>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="font-semibold">Your Library</h2>
            <p className="mt-1 text-sm text-slate-500">
              {books.length} {books.length === 1 ? "book" : "books"} in your
              account
            </p>
          </div>
        </div>

        {books.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-slate-700">No books found</p>
            <p className="mt-2 text-sm text-slate-500">
              Your books will appear here when they are added to your account.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Book</th>
                  <th className="px-6 py-4 font-medium">ISBN</th>
                  <th className="px-6 py-4 font-medium">Genre</th>
                  <th className="px-6 py-4 font-medium">Published</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Copies Sold</th>
                  <th className="px-6 py-4 font-medium">Royalties Earned</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
  {books.map((book) => (
    <tr
      key={book.id}
      onClick={() => navigate(`/author/books/${book.id}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          navigate(`/author/books/${book.id}`);
        }
      }}
      tabIndex={0}
      role="link"
      aria-label={`View details for ${book.title}`}
      className="cursor-pointer hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-600"
    >
      <td className="px-6 py-4 font-medium text-slate-900">
        {book.title}
      </td>

      <td className="whitespace-nowrap px-6 py-4 text-slate-500">
        {book.isbn}
      </td>

      <td className="px-6 py-4 text-slate-600">{book.genre}</td>

      <td className="whitespace-nowrap px-6 py-4 text-slate-600">
        {formatDate(book.publicationDate)}
      </td>

      <td className="px-6 py-4">
        <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {book.status}
        </span>
      </td>

      <td className="px-6 py-4 text-slate-600">
        {book.totalCopiesSold}
      </td>

      <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900">
        {formatCurrency(book.totalRoyaltyEarned)}
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
