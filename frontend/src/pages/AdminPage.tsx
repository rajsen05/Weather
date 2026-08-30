import React, { useState, useEffect } from 'react';
import { ShieldCheck, Server, Database, Activity, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export const AdminPage: React.FC = () => {
  const [status, setStatus] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSystemStatus()
      .then(setStatus)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          System Administration & Health Console
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Server runtime diagnostics, background scheduler telemetry, and database integrity metrics.
        </p>
      </div>

      {status ? (
        <div className="space-y-6">
          
          {/* Status KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="skyguard-card p-4 border rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase">System Status</span>
              <span className="block text-2xl font-extrabold font-mono text-emerald-500 mt-1">
                {status.status}
              </span>
            </div>

            <div className="skyguard-card p-4 border rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Registered Stations</span>
              <span className="block text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
                {status.database_metrics?.total_stations}
              </span>
            </div>

            <div className="skyguard-card p-4 border rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Observations Logged</span>
              <span className="block text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
                {status.database_metrics?.total_observations_recorded}
              </span>
            </div>

            <div className="skyguard-card p-4 border rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Audit Records</span>
              <span className="block text-2xl font-extrabold font-mono text-cyan-500 mt-1">
                {status.database_metrics?.audit_ledger_records}
              </span>
            </div>
          </div>

          {/* Providers Status */}
          <div className="skyguard-card p-6 border rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-sky-500" />
              <span>Weather Provider Status</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800">
                <span className="font-bold text-emerald-700 dark:text-emerald-300 block">Open-Meteo Global</span>
                <span className="text-slate-500 mt-1 block">Status: ACTIVE</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                <span className="font-bold text-slate-700 dark:text-slate-200 block">IMD Official AWS</span>
                <span className="text-slate-400 mt-1 block">Status: Ready for Credentials</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                <span className="font-bold text-slate-700 dark:text-slate-200 block">OpenWeatherMap</span>
                <span className="text-slate-400 mt-1 block">Status: Ready for Key</span>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

    </div>
  );
};
