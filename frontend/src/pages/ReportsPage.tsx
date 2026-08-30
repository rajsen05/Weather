import React from 'react';
import { FileText, Download, ShieldCheck, AlertTriangle, HeartPulse, Sparkles } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const reports = [
    {
      title: "Weather Trust Score & Integrity Audit Report",
      description: "Official summary of all multi-factor trust score evaluations, data freshness, and credibility indices.",
      icon: ShieldCheck,
      color: "text-emerald-500 bg-emerald-100 dark:bg-emerald-950",
      csvUrl: "http://localhost:8000/api/v1/reports/trust-scores/csv"
    },
    {
      title: "Comprehensive Anomaly Detection & Diagnosis Report",
      description: "Complete ledger of detected sensor glitches, rate-of-change jumps, and confirmed severe weather squalls.",
      icon: AlertTriangle,
      color: "text-amber-500 bg-amber-100 dark:bg-amber-950",
      csvUrl: "http://localhost:8000/api/v1/reports/anomalies/csv"
    },
    {
      title: "Data Provenance & Observation Integrity Ledger",
      description: "Full cryptographic-style audit log verifying 100% preservation of raw sensor data across the 13-stage pipeline.",
      icon: FileText,
      color: "text-sky-500 bg-sky-100 dark:bg-sky-950",
      csvUrl: "http://localhost:8000/api/v1/reports/audit-ledger/csv"
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Meteorological Reports & Data Export Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Export verified government reports, anomaly ledgers, and sensor health assessments in CSV and structured formats.
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reports.map((rep, idx) => {
          const Icon = rep.icon;
          return (
            <div key={idx} className="skyguard-card p-6 border rounded-2xl flex flex-col justify-between space-y-4">
              <div>
                <div className={`w-12 h-12 rounded-xl ${rep.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {rep.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {rep.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <a
                  href={rep.csvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-600 text-white shadow-sm transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Verified CSV Report</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
