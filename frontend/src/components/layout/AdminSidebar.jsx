import { NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Bot,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import logoImage from '../../../logo.png';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/reports', label: 'Reports', icon: FileText },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/citizens', label: 'Citizens', icon: Users },
  { to: '/admin/ai-reports', label: 'AI Reports', icon: Bot },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
  const { logout, isLoggingOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-white/10 bg-slate-950/90 text-white backdrop-blur-xl">
      <div className="border-b border-white/10 px-6 py-5">
        <div className="flex items-center gap-3">
          <img
            src={logoImage}
            alt="SmartNagar logo"
            className="h-8 w-auto rounded-md object-contain shadow-sm"
          />
          <div>
            <h1 className="text-lg font-semibold">SmartNagar Admin</h1>
            <p className="text-xs text-slate-400">Government Analytics Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-gradient-to-r from-emerald-600/30 to-blue-600/30 text-white'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="m-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 transition hover:bg-red-500/20 hover:text-red-200"
      >
        <LogOut className="h-4 w-4" />
        {isLoggingOut ? 'Logging out...' : 'Logout'}
      </button>
    </aside>
  );
}
