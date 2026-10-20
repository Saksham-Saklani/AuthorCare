import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Ticket, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const navItems = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Support Tickets",
      path: "/admin/tickets",
      icon: Ticket,
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white p-6 md:block">
        <h1 className="text-xl font-bold tracking-tight">AuthorCare</h1>
        <p className="mt-1 text-xs text-slate-500">BookLeaf Publishing</p>

        <div className="mt-8 rounded-lg bg-indigo-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
            Admin Portal
          </p>
          <p className="mt-1 text-sm font-semibold text-indigo-900">
            Support Management
          </p>
        </div>

        <nav className="mt-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
          <div>
            <p className="text-xs text-slate-500">Administrator</p>
            <p className="font-medium">{user?.name}</p>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <LogOut size={16} />
            Logout
          </button>
        </header>

        <main className="flex-1 p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}