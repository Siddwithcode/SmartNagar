import { motion } from 'framer-motion';
import { MapPinOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-6 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card max-w-md rounded-2xl p-8 text-center"
      >
        <MapPinOff className="mx-auto h-12 w-12 text-blue-600" />
        <h1 className="mt-4 text-6xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">Page not found in SmartNagar portal.</p>
        <Button asChild className="mt-6">
          <Link to="/">Go Home</Link>
        </Button>
      </motion.div>
    </div>
  );
}
