import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';

export const SelfHealingPage: React.FC = () => {
  const [overview, setOverview] = useState<any | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getConsensusOverview(),
      api.getCorrectedRecords()
    ]).then(([ov, recs]) => {
      setOverview(ov);
      setRecords(recs);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Consensus-Based Self-Healing Center
          </h1>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
            ⭐ FLAGSHIP USP 3
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Tri-model ensemble (Temporal Lag, Diurnal Baseline, Multivariate Regression) calculates inter-model consensus agreement before any automated estimate is accepted.
        </p>
      </div>

      {/* Scientific Integrity Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <div>
            <span className="font-bold text-sm text-emerald-900 dark:text-emerald-200 block">
              100% Immutable Raw Observation Guarantee
            </span>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              SkyGuard AI NEVER overwrites or corrupts the raw meteorological database. Corrected values are saved side-by-side with full provenance.
            </p>
          </div>
        </div>
      </div>

      {/* Overview Metric Stats */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="skyguard-card p-5 border rounded-2xl text-center">
            <span className="text-xs font-bold text-slate-400 uppercase block">Total Self-Healing Audits</span>
            <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white mt-1 block">
              {overview.total_estimations}
            </span>
          </div>

          <div className="skyguard-card p-5 border rounded-2xl text-center">
            <span className="text-xs font-bold text-emerald-500 uppercase block">Safe Auto-Estimates Accepted</span>
            <span className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
              {overview.safe_auto_estimates}
            </span>
            <span className="text-[11px] text-slate-400">Model agreement &ge; 85%</span>
          </div>

          <div className="skyguard-card p-5 border rounded-2xl text-center">
            <span className="text-xs font-bold text-purple-500 uppercase block">Human Review Required (Diverged)</span>
            <span className="text-3xl font-extrabold font-mono text-purple-600 dark:text-purple-400 mt-1 block">
              {overview.human_review_required}
            </span>
            <span className="text-[11px] text-slate-400">Correction withheld for integrity</span>
          </div>
        </div>
      )}

      {/* Corrected Observations Table */}
      <div className="skyguard-card border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Timestamp / Parameter</th>
                <th className="p-4">Raw Preserved Value</th>
                <th className="p-4">Model A (Temporal)</th>
                <th className="p-4">Model B (Diurnal)</th>
                <th className="p-4">Model C (Multivariate)</th>
                <th className="p-4">Agreement %</th>
                <th className="p-4">Consensus Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {records.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <div>
                      <span className="font-bold uppercase text-slate-900 dark:text-white block font-sans">
                        {rec.parameter}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(rec.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </td>

                  <td className="p-4 font-extrabold text-rose-500 line-through">
                    {rec.original_value !== null ? `${rec.original_value}°C` : "NULL"}
                  </td>

                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {rec.model_temporal_estimate}°C
                  </td>

                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {rec.model_historical_estimate}°C
                  </td>

                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {rec.model_multivariate_estimate}°C
                  </td>

                  <td className="p-4 font-bold text-sky-600 dark:text-cyan-400">
                    {rec.model_agreement_percent}%
                  </td>

                  <td className="p-4 font-sans">
                    <StatusBadge status={rec.status} type="healing" />
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
