import { Bell, Search } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Navbar } from '@/components/layout/Navbar';
import { Input } from '@/components/ui/input';

export function AdminLayout() {
  return (
    <div className="min-h-svh bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-foreground dark">
      <AdminSidebar />
      <div className="ml-64 min-h-svh p-6 lg:p-8">
        <Navbar title="Admin Dashboard">
          <div className="relative hidden max-w-sm flex-1 md:block">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search reports, citizens..." className="pl-9" />
          </div>
          <button className="relative rounded-xl border border-border/50 bg-background/50 p-2.5">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500" />
          </button>
        </Navbar>
        <Outlet />
      </div>
    </div>
  );
}
