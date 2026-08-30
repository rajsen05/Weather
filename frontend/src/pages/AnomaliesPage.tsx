import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Filter, Search, ArrowRight, ShieldAlert, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { AnomalyRecord } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

export const AnomaliesPage: React.FC = () => {
  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>([]);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnomalies({
      severity: severityFilter !== 'ALL' ? severityFilter : undefined,
      status: statusFilter !== 'ALL' ? statusFilter : undefined
    }).then((data) => {
      setAnomalies(data);
      setLoading(false);
    });
  }, [severityFilter, statusFilter]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Anomaly Detection & Lifecycle Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time hybrid AI/ML detection ledger with adaptive evidence verification lifecycle tracking.
          </p>
        </div>

        {/* Severity Filters */}
        <div className="flex items-center gap-3">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs font-semibold py-1.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Severity</option>
            <option value="HIGH">High Severity</option>
            <option value="SUSPICIOUS">Suspicious</option>
            <option value="WATCH">Watch</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold py-1.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">All Lifecycle States</option>
            <option value="UNDER_VERIFICATION">Under Verification</option>
            <option value="CONFIRMED_ANOMALY">Confirmed Sensor Fault</option>
            <option value="CONFIRMED_GENUINE_WEATHER_EVENT">Probable Weather Event</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Anomalies Table */}
      <div className="skyguard-card border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Anomaly ID / Time</th>
                <th className="p-4">Station Code</th>
                <th className="p-4">Probable Root Cause</th>
                <th className="p-4">AI Score / Severity</th>
                <th className="p-4">Verification Lifecycle</th>
                <th className="p-4">Diagnostic Confidence</th>
                <th className="p-4 text-right">Deep Dive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
              {anomalies.map((anom) => (
                <tr key={anom.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white font-mono block">
                          #{anom.id}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(anom.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 font-mono font-bold text-sky-600 dark:text-cyan-400">
                    Station #{anom.station_id}
                  </td>

                  <td className="p-4">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      {anom.probable_cause}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate max-w-xs block">
                      {anom.evidence_summary || "Telemetry evaluated"}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-slate-900 dark:text-white text-sm">
                        {anom.composite_score}
                      </span>
                      <StatusBadge status={anom.severity} type="severity" />
                    </div>
                  </td>

                  <td className="p-4">
                    <StatusBadge status={anom.status} type="lifecycle" />
                  </td>

                  <td className="p-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                    {anom.confidence}%
                  </td>

                  <td className="p-4 text-right">
                    <Link
                      to={`/anomalies/${anom.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-50 dark:bg-slate-800 text-sky-600 dark:text-cyan-400 hover:bg-sky-100 transition-colors"
                    >
                      <span>Diagnose</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
