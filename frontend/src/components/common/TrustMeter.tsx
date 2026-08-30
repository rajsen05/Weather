import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

interface TrustMeterProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showBreakdown?: boolean;
  breakdown?: {
    data_quality?: number;
    temporal?: number;
    multivariate?: number;
    historical?: number;
    freshness?: number;
    sensor_health?: number;
  };
}

export const TrustMeter: React.FC<TrustMeterProps> = ({
  score,
  size = 'md',
  showBreakdown = false,
  breakdown
}) => {
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));

  let colorClass = 'text-emerald-500 stroke-emerald-500';
  let bgBadge = 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
  let categoryLabel = 'TRUSTED';
  let Icon = ShieldCheck;

  if (normalizedScore < 50) {
    colorClass = 'text-rose-500 stroke-rose-500';
    bgBadge = 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800';
    categoryLabel = 'LOW TRUST';
    Icon = ShieldX;
  } else if (normalizedScore < 80) {
    colorClass = 'text-amber-500 stroke-amber-500';
    bgBadge = 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800';
    categoryLabel = 'UNCERTAIN';
    Icon = ShieldAlert;
  }

  // Circular gauge calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center">
        <svg className={size === 'lg' ? 'w-28 h-28' : size === 'sm' ? 'w-16 h-16' : 'w-24 h-24'} viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="stroke-slate-200 dark:stroke-slate-700"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            className={`${colorClass} transition-all duration-1000 ease-out`}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            transform="rotate(-90 50 50)"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`font-mono font-extrabold text-slate-900 dark:text-white ${
            size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-xl'
          }`}>
            {normalizedScore}
          </span>
          <span className="text-[9px] uppercase font-bold text-slate-400">/ 100</span>
        </div>
      </div>

      <div className={`mt-2 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${bgBadge}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{categoryLabel}</span>
      </div>

      {/* Sub-score breakdown drawer */}
      {showBreakdown && breakdown && (
        <div className="w-full mt-4 space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
            <span>Data Quality QC</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-slate-200">{breakdown.data_quality ?? 100}%</span>
          </div>
          <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
            <span>Temporal Dynamics</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-slate-200">{breakdown.temporal ?? 100}%</span>
          </div>
          <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
            <span>Multivariate Coupling</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-slate-200">{breakdown.multivariate ?? 100}%</span>
          </div>
          <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
            <span>Historical Baseline</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-slate-200">{breakdown.historical ?? 100}%</span>
          </div>
          <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
            <span>Observation Freshness</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-slate-200">{breakdown.freshness ?? 100}%</span>
          </div>
        </div>
      )}
    </div>
  );
};
