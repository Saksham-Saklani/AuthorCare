import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MessageSquare } from "lucide-react";
import api from "../../services/api";
import type { Book } from "../../types";

export default function AuthorBookDetails() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBook = async () => {
      if (!bookId) {
        setError("Book ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/books/${bookId}`);
        setBook(response.data.data.book);
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message
          : undefined;

        setError(
          typeof message === "string"
            ? message
            : "Unable to load book details.",
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchBook();
  }, [bookId]);

  const formatCurrency = (amount: number | string) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount));

  const formatDate = (date: string | null) => {
    if (!date) return "Not available";

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(new Date(date));
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading book details...</p>;
  }

  if (error || !book) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate("/author/books")}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to My Books
        </button>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error || "Book not found."}
        </div>
      </div>
    );
  }

  const availableOn = book.availableOn ?? [];

  const details = [
    { label: "ISBN", value: book.isbn },
    { label: "Genre", value: book.genre },
    { label: "Publication Date", value: formatDate(book.publicationDate) },
    { label: "MRP", value: formatCurrency(book.mrp) },
    {
      label: "Royalty per Copy",
      value: formatCurrency(book.authorRoyaltyPerCopy),
    },
    { label: "Print Partner", value: book.printPartner || "Not available" },
  ];

  const royaltyDetails = [
    {
      label: "Copies Sold",
      value: book.totalCopiesSold.toLocaleString("en-IN"),
    },
    { label: "Total Earned", value: formatCurrency(book.totalRoyaltyEarned) },
    { label: "Royalties Paid", value: formatCurrency(book.royaltyPaid) },
    { label: "Pending Royalties", value: formatCurrency(book.royaltyPending) },
    {
      label: "Last Royalty Payout",
      value: formatDate(book.lastRoyaltyPayoutDate ?? null),
    },
  ];

  return (
    <div className="space-y-8">
      <Link
        to="/author/books"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600"
      >
        <ArrowLeft size={16} />
        Back to My Books
      </Link>

      <section>
        <p className="text-sm font-medium text-indigo-600">Book Details</p>

        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {book.title}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Publishing information, sales, and royalty summary.
            </p>
          </div>

          <span className="w-fit rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
            {book.status}
          </span>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold">Book Information</h2>

        <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {details.map((item) => (
            <div key={item.label}>
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-1 font-medium text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold">Sales & Royalties</h2>

        <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {royaltyDetails.map((item) => (
            <div key={item.label}>
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold">Distribution</h2>

        {availableOn.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            No distribution platforms listed.
          </p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            {availableOn.map((platform) => (
              <span
                key={platform}
                className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700"
              >
                {platform}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">Need help with this book?</h2>
          <p className="mt-1 text-sm text-slate-600">
            Contact support about this specific title.
          </p>
        </div>

        <button
          onClick={() =>
            navigate(
              `/author/tickets/new?bookId=${encodeURIComponent(book.id)}`,
            )
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          <MessageSquare size={16} />
          Contact Support
        </button>
      </section>
    </div>
  );
}
