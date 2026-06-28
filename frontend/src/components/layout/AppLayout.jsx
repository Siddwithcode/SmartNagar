import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';

export function AppLayout() {
  return (
    <div className="min-h-svh bg-gradient-to-br from-emerald-50/50 via-background to-blue-50/50 dark:from-slate-950 dark:via-background dark:to-blue-950/30">
      <Sidebar />
      <div className="ml-64 min-h-svh p-6 lg:p-8">
        <Navbar />
        <Outlet />
      </div>
    </div>
  );
}
