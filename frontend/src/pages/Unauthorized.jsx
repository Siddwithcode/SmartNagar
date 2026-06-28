import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Unauthorized() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-6 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card max-w-md rounded-2xl p-8 text-center"
      >
        <ShieldAlert className="mx-auto h-12 w-12 text-amber-500" />
        <h1 className="mt-4 text-2xl font-semibold">Access Denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You do not have permission to view this page. Admin access is required.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Back to Dashboard</Link>
        </Button>
      </motion.div>
    </div>
  );
}
