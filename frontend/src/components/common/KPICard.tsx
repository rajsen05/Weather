import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorScheme?: 'sky' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'purple';
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'sky'
}) => {
  const colorMap = {
    sky: 'from-sky-500/10 to-sky-500/5 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800/60',
    cyan: 'from-cyan-500/10 to-cyan-500/5 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/60',
    emerald: 'from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
    amber: 'from-amber-500/10 to-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
    rose: 'from-rose-500/10 to-rose-500/5 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60',
    purple: 'from-purple-500/10 to-purple-500/5 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/60',
  };

  const iconBgMap = {
    sky: 'bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400',
    cyan: 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400',
    purple: 'bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className={`p-5 rounded-2xl border skyguard-card bg-gradient-to-br ${colorMap[colorScheme]} transition-all`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${iconBgMap[colorScheme]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
          {value}
        </span>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            trend.isPositive 
              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' 
              : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
          }`}>
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      )}
    </div>
  );
};
