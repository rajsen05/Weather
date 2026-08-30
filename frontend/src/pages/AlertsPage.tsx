import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { MaintenanceAlertRecord } from '../types';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<MaintenanceAlertRecord[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMaintenanceAlerts().then((data) => {
      setAlerts(data);
      setLoading(false);
    });
  }, []);

  const handleAcknowledge = async (id: number) => {
    await api.acknowledgeAlert(id);
    const updated = await api.getMaintenanceAlerts();
    setAlerts(updated);
  };

  const handleResolve = async (id: number) => {
    await api.resolveAlert(id);
    const updated = await api.getMaintenanceAlerts();
    setAlerts(updated);
  };

  const filtered = alerts.filter((a) => {
    if (filter === 'ALL') return true;
    return a.status === filter;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Alerts & Incident Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time critical anomaly, sensor degradation, and meteorological hardware alert management.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {['ALL', 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                filter === st
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-cyan-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="space-y-4">
        {filtered.map((a) => (
          <div key={a.id} className="skyguard-card p-5 border rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className={`p-3 rounded-xl ${
                a.severity === 'CRITICAL' ? 'bg-rose-100 dark:bg-rose-950 text-rose-600' : 'bg-amber-100 dark:bg-amber-950 text-amber-600'
              }`}>
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{a.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    a.severity === 'CRITICAL' ? 'bg-rose-100 dark:bg-rose-950 text-rose-600' : 'bg-amber-100 dark:bg-amber-950 text-amber-600'
                  }`}>
                    {a.severity}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Station #{a.station_id}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
                  {a.recommendation}
                </p>
                <span className="text-[10px] text-slate-400 mt-1.5 block">
                  Logged: {new Date(a.created_at).toLocaleString()} • Status: <strong className="uppercase text-slate-700 dark:text-slate-200">{a.status}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              {a.status === 'ACTIVE' && (
                <button
                  onClick={() => handleAcknowledge(a.id)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
                >
                  Acknowledge
                </button>
              )}
              {a.status !== 'RESOLVED' && (
                <button
                  onClick={() => handleResolve(a.id)}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
                >
                  Resolve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
