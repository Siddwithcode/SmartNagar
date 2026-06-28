import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function LoadingScreen({ message = 'Loading SmartNagar...' }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card flex flex-col items-center gap-4 rounded-2xl px-10 py-8"
      >
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        <p className="text-sm font-medium text-muted-foreground">{message}</p>
      </motion.div>
    </div>
  );
}
