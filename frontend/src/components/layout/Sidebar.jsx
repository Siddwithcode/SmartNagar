import { NavLink } from 'react-router-dom';
import { FileWarning, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import logoImage from '../../../logo.png';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/report', label: 'Report Issue', icon: FileWarning },
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-white/20 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
      <div className="border-b border-white/20 px-6 py-5 dark:border-white/10">
        <div className="flex items-center gap-3">
          <img
            src={logoImage}
            alt="SmartNagar logo"
            className="h-8 w-auto rounded-md object-contain shadow-sm"
          />
          <div>
            <h1 className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-lg font-semibold text-transparent">
              SmartNagar
            </h1>
            <p className="text-xs text-muted-foreground">Citizen Portal</p>
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
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:translate-x-0.5',
                isActive
                  ? 'bg-gradient-to-r from-emerald-600/15 to-blue-600/15 text-emerald-700 dark:text-emerald-300'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
