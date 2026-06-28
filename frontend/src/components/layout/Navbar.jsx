import { LogOut, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export function Navbar({ title, children }) {
  const { user, logout, isLoggingOut } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const initials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/20 bg-white/60 px-6 py-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
      <div>
        {title && <h2 className="text-xl font-semibold tracking-tight">{title}</h2>}
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        {children}

        <Button variant="outline" size="icon" onClick={toggleTheme}>
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/80 px-3 py-2 transition hover:shadow-md">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-blue-600 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium">{user?.name}</p>
                <Badge variant="secondary" className="mt-0.5 text-[10px]">
                  {user?.role}
                </Badge>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <div>{user?.name}</div>
              <div className="text-xs font-normal text-muted-foreground">{user?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>Civic Points: {user?.civicPoints ?? 0}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
