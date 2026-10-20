import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthorLayout from "./components/layout/AuthorLayout";
import AuthorDashboard from "./components/author/AuthorDashboard";
import AuthorBooks from "./components/author/AuthorBooks";
import BookDetails from "./components/author/BookDetails";
import AuthorTickets from "./components/author/AuthorTickets";
import AuthorTicketDetail from "./components/author/AuthorTicketDetails";
import TicketForm from "./components/author/TicketForm";
import AdminLayout from "./components/layout/AdminLayout";
import AdminTickets from "./components/admin/AdminTickets";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminTicketDetails from "./components/admin/AdminTicketDetails";

function AppRoutes() {
  const { user, loading } = useAuth();

  function PublicRoute({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();

    if (user) {
      return (
        <Navigate to={user.role === "ADMIN" ? "/admin" : "/author"} replace />
      );
    }

    return children;
  }

  if (loading) {
    return <div className="p-6 text-center">Loading AuthorCare...</div>;
  }

  return (
    <Routes>
      {/* Default redirect */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate
              to={user.role === "ADMIN" ? "/admin" : "/author"}
              replace
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Authentication routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Author routes: accessible to authors and admins */}
      <Route element={<ProtectedRoute allowedRole="AUTHOR" />}>
        <Route path="/author" element={<AuthorLayout />}>
          <Route index element={<AuthorDashboard />} />
          <Route path="books" element={<AuthorBooks />} />
          <Route path="books/:bookId" element={<BookDetails />} />
          <Route path="tickets" element={<AuthorTickets />} />
          <Route path="tickets/:ticketId" element={<AuthorTicketDetail />} />
          <Route path="tickets/new" element={<TicketForm />} />
        </Route>
      </Route>

      {/* Admin routes: accessible only to admins */}
      <Route element={<ProtectedRoute allowedRole="ADMIN" />}>
        <Route
          path="/admin"
          element={<AdminLayout />}
        >
        <Route index element={<AdminDashboard />} />
        <Route path="/admin/tickets" element={<AdminTickets />} />
        <Route path="/admin/tickets/:ticketId" element={<AdminTicketDetails />} />
        </Route>
      </Route>

      {/* Unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
