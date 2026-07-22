import { NavLink, Outlet, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  Calendar,
  Factory,
  Map,
  Building2,
  Inbox,
  Search,
  Settings,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../AuthContext';

const nav = [
  { to: '/admin', end: true, label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/pages', label: 'Pages', icon: FileText },
  { to: '/admin/articles', label: 'Articles', icon: Newspaper },
  { to: '/admin/evenements', label: 'Événements', icon: Calendar },
  { to: '/admin/secteurs', label: 'Secteurs', icon: Factory },
  { to: '/admin/zones', label: 'Zones', icon: Map },
  { to: '/admin/references', label: 'Références', icon: Building2 },
  { to: '/admin/leads', label: 'Leads', icon: Inbox },
  { to: '/admin/seo', label: 'SEO', icon: Search },
  { to: '/admin/settings', label: 'Réglages', icon: Settings },
];

export function AdminLayout() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-admin-bg text-sm text-admin-mute">
        Chargement…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-admin-bg font-sans text-admin-ink">
      <aside className="flex w-60 shrink-0 flex-col bg-admin-sidebar text-white">
        <div className="border-b border-white/10 px-4 py-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-admin-sidebarMuted">
            Back-office
          </p>
          <p className="mt-1 text-sm font-semibold">Cabinet Conseil</p>
        </div>
        <nav className="flex-1 space-y-0.5 p-2">
          {nav.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-admin-sidebarMuted hover:bg-white/5 hover:text-white',
                )
              }
            >
              <Icon size={16} strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3">
          <p className="truncate px-2 text-xs text-admin-sidebarMuted">{user.email}</p>
          <div className="mt-2 flex gap-1">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs text-admin-sidebarMuted hover:bg-white/5 hover:text-white"
            >
              <ExternalLink size={12} /> Site
            </a>
            <button
              type="button"
              onClick={() => void logout()}
              className="flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs text-admin-sidebarMuted hover:bg-white/5 hover:text-white"
            >
              <LogOut size={12} /> Quitter
            </button>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 overflow-auto p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
