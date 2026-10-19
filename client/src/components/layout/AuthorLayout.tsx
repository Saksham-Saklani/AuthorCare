import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AuthorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const navItems = [
    { label: "Dashboard", path: "/author" },
    { label: "Books", path: "/author/books" },
    { label: "Tickets", path: "/author/tickets" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="w-60 border-r border-slate-200 bg-white p-6">
        <h1 className="text-xl font-bold tracking-tight">Author Care</h1>
        <p className="mt-1 text-xs text-slate-500">Community Support</p>

        <nav className="mt-10 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/author"}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-sm font-medium ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4">
          <div>
            <p className="text-xs text-slate-500">Author Portal</p>
            <p className="font-medium">{user?.name}</p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
          >
            Logout
          </button>
        </header>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}