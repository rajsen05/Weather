import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, XCircle, Sparkles, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  type?: 'severity' | 'lifecycle' | 'provider' | 'healing';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'severity' }) => {
  const norm = status.toUpperCase();

  // Severity style map
  if (type === 'severity' || norm === 'NORMAL' || norm === 'WATCH' || norm === 'SUSPICIOUS' || norm === 'HIGH' || norm === 'CRITICAL') {
    switch (norm) {
      case 'NORMAL':
      case 'HEALTHY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            <span>NORMAL</span>
          </span>
        );
      case 'WATCH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <AlertCircle className="w-3 h-3" />
            <span>WATCH</span>
          </span>
        );
      case 'SUSPICIOUS':
      case 'DEGRADED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3" />
            <span>SUSPICIOUS</span>
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-800">
            <AlertTriangle className="w-3 h-3" />
            <span>HIGH</span>
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse">
            <XCircle className="w-3 h-3" />
            <span>CRITICAL</span>
          </span>
        );
    }
  }

  // Lifecycle status map
  if (norm === 'UNDER_VERIFICATION') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-400 dark:border-amber-700">
        <Clock className="w-3 h-3 animate-spin" />
        <span>UNDER VERIFICATION</span>
      </span>
    );
  }
  if (norm === 'CONFIRMED_GENUINE_WEATHER_EVENT') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-400 dark:border-indigo-700">
        <Sparkles className="w-3 h-3" />
        <span>PROBABLE WEATHER EVENT</span>
      </span>
    );
  }
  if (norm === 'CONFIRMED_ANOMALY') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-400 dark:border-rose-700">
        <XCircle className="w-3 h-3" />
        <span>CONFIRMED SENSOR FAULT</span>
      </span>
    );
  }
  if (norm === 'SAFE_ESTIMATE') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-400 dark:border-emerald-700">
        <CheckCircle2 className="w-3 h-3" />
        <span>CONSENSUS RECOVERED</span>
      </span>
    );
  }
  if (norm === 'HUMAN_VERIFICATION_REQUIRED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-400 dark:border-purple-700">
        <AlertTriangle className="w-3 h-3" />
        <span>HUMAN REVIEW REQUIRED</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
      {status}
    </span>
  );
};
