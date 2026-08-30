import React, { useState, useEffect } from 'react';
import { ShieldCheck, Database, Lock, CheckCircle2, Download } from 'lucide-react';
import { api } from '../services/api';
import { AuditLogRecord } from '../types';

export const AuditLedgerPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAuditLedger(100).then((data) => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Observation Integrity & Provenance Ledger
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              IMMUTABLE AUDIT LOG
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete provenance audit chain verifying that original physical sensor readings are strictly preserved alongside AI corrections.
          </p>
        </div>

        <a
          href="http://localhost:8000/api/v1/reports/audit-ledger/csv"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 transition-all shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit CSV</span>
        </a>
      </div>

      {/* Trust & Immutability Architecture Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="skyguard-card p-4 border rounded-2xl flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">Raw Observation Immutability</span>
            <span className="text-[11px] text-slate-500">Readings cannot be altered post-ingest</span>
          </div>
        </div>

        <div className="skyguard-card p-4 border rounded-2xl flex items-center gap-3">
          <div className="p-3 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">Dual-Track Record Storage</span>
            <span className="text-[11px] text-slate-500">Original + Estimated preserved side-by-side</span>
          </div>
        </div>

        <div className="skyguard-card p-4 border rounded-2xl flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">Full Provenance Hash Chain</span>
            <span className="text-[11px] text-slate-500">Traceable 13-stage decision ledger</span>
          </div>
        </div>
      </div>

      {/* Audit Table */}
      <div className="skyguard-card border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider font-mono">
              <tr>
                <th className="p-4">Audit ID / Time (UTC)</th>
                <th className="p-4">Entity Type</th>
                <th className="p-4">Pipeline Action</th>
                <th className="p-4">Pipeline Stage</th>
                <th className="p-4">Provenance Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">
                        #{log.id}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </td>

                  <td className="p-4 font-bold text-sky-600 dark:text-cyan-400">
                    {log.entity_type} #{log.entity_id}
                  </td>

                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
                      {log.action}
                    </span>
                  </td>

                  <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                    {log.stage}
                  </td>

                  <td className="p-4 font-sans text-xs text-slate-600 dark:text-slate-300 max-w-md">
                    {log.details}
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
