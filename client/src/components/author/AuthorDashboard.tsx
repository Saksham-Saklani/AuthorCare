import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

interface Book {
  id: string;
  title: string;
  isbn: string;
  status: string;
  totalCopiesSold: number;
  totalRoyaltyEarned: string | number;
  royaltyPaid: string | number;
  royaltyPending: string | number;
}

export default function AuthorDashboard() {
  const navigate = useNavigate();

  const [books, setBooks] = useState<Book[]>([]);
  const [ticketCount, setTicketCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/books");

        setBooks(response.data.data.books);

        const ticketsResponse = await api.get("/tickets");

        setTicketCount(ticketsResponse.data.data.tickets.length);
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

    void fetchData();
  }, []);

  const totalRoyalties = books.reduce(
    (sum, book) => sum + Number(book.totalRoyaltyEarned),
    0,
  );

  const royaltiesPending = books.reduce(
    (sum, book) => sum + Number(book.royaltyPending),
    0,
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading your dashboard...</p>;
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

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage your books, track royalties, and follow your support requests.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <button
          onClick={() => navigate("/author/books")}
          className="rounded-xl border border-slate-200 bg-white p-6 text-left transition hover:border-indigo-300 hover:shadow-sm"
        >
          <p className="text-sm font-medium text-slate-500">My Books</p>

          <p className="mt-3 text-3xl font-semibold">{books.length}</p>

          <p className="mt-2 text-sm text-slate-500">
            View your published titles.
          </p>
        </button>

        

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-medium text-slate-500">Royalties Earned</p>

          <p className="mt-3 text-2xl font-semibold">
            {formatCurrency(totalRoyalties)}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Total across your books.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-medium text-slate-500">
            Pending Royalties
          </p>

          <p className="mt-3 text-2xl font-semibold">
            {formatCurrency(royaltiesPending)}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Outstanding across your books.
          </p>

          
        </div>

        <button
          onClick={() => navigate("/author/tickets")}
          className="rounded-xl border border-slate-200 bg-white p-6 text-left transition hover:border-indigo-300 hover:shadow-sm"
        >
          <p className="text-sm font-medium text-slate-500">My Tickets</p>

          <p className="mt-3 text-2xl font-semibold">{ticketCount}</p>

          <p className="mt-2 text-sm text-slate-500">
            Track your support requests.
          </p>
        </button>
      </section>
    </div>
  );
}
