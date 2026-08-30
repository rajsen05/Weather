import React, { useState, useEffect } from 'react';
import { Wrench, CheckCircle2, AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { MaintenanceAlertRecord } from '../types';

export const MaintenancePage: React.FC = () => {
  const [alerts, setAlerts] = useState<MaintenanceAlertRecord[]>([]);
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

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Predictive Maintenance & Work Orders Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Automated transducer failure risk classification and prioritized operational maintenance recommendations.
        </p>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="skyguard-card p-5 border rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className={`p-3 rounded-xl ${
                alert.severity === 'CRITICAL' 
                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400' 
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
              }`}>
                <Wrench className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {alert.title}
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    alert.severity === 'CRITICAL' ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  }`}>
                    {alert.severity}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Station #{alert.station_id} ({alert.sensor_type})
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
                  {alert.recommendation}
                </p>

                <span className="text-[10px] text-slate-400 mt-1.5 block">
                  Logged: {new Date(alert.created_at).toLocaleString()} • Status: <strong className="uppercase text-slate-700 dark:text-slate-200">{alert.status}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              {alert.status === 'ACTIVE' && (
                <button
                  onClick={() => handleAcknowledge(alert.id)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
                >
                  Acknowledge
                </button>
              )}

              {alert.status !== 'RESOLVED' && (
                <button
                  onClick={() => handleResolve(alert.id)}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
                >
                  Resolve Alert
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
