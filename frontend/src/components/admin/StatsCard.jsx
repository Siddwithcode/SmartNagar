import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function StatsCard({ title, value, icon: Icon, accent = 'from-emerald-500/20 to-blue-500/20' }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className={cn(
        'glass-card rounded-2xl border border-white/20 p-5 shadow-sm transition-shadow hover:shadow-lg',
        `bg-gradient-to-br ${accent}`
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold">{value}</p>
        </div>
        {Icon && (
          <div className="rounded-xl bg-background/60 p-2.5 shadow-sm">
            <Icon className="h-4 w-4 text-emerald-600" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
