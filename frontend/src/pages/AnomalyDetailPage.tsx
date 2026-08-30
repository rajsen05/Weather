import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  AlertTriangle, ArrowLeft, CheckCircle2, XCircle, 
  Sparkles, ShieldCheck, Clock, BrainCircuit, Activity 
} from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { ProgressiveDisclosure } from '../components/common/ProgressiveDisclosure';

export const AnomalyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any | null>(null);
  const [explanation, setExplanation] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (id) {
      const anomId = parseInt(id);
      Promise.all([
        api.getAnomalyDeepDive(anomId),
        api.getAnomalyExplanation(anomId)
      ]).then(([d, exp]) => {
        setData(d);
        setExplanation(exp);
        setLoading(false);
      });
    }
  }, [id]);

  const handleResolve = async () => {
    if (!id) return;
    setResolving(true);
    try {
      await api.resolveAnomaly(parseInt(id));
      const updated = await api.getAnomalyDeepDive(parseInt(id));
      setData(updated);
    } catch (err) {
      console.error("Failed to resolve", err);
    } finally {
      setResolving(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { anomaly, station, observation, verification_timeline, self_healing } = data;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/anomalies"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Anomaly Deep Dive #{anomaly.id}
              </h1>
              <StatusBadge status={anomaly.status} type="lifecycle" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Station: <span className="font-bold text-slate-800 dark:text-slate-200">{station?.name}</span> ({station?.code}) • Triggered: {new Date(anomaly.timestamp).toLocaleString()}
            </p>
          </div>
        </div>

        {anomaly.status !== 'RESOLVED' && (
          <button
            onClick={handleResolve}
            disabled={resolving}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-sm flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{resolving ? "Resolving..." : "Mark Anomaly as Resolved"}</span>
          </button>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="skyguard-card p-5 border rounded-2xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Diagnosed Root Cause</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block">
            {anomaly.probable_cause}
          </span>
          <span className="text-xs font-bold text-emerald-500 font-mono mt-1 block">
            {anomaly.confidence}% Confidence
          </span>
        </div>

        <div className="skyguard-card p-5 border rounded-2xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Raw Ingested Values</span>
          <div className="flex items-center gap-4 mt-1 font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
            <span>Temp: {observation?.temperature}°C</span>
            <span>Pres: {observation?.pressure} hPa</span>
            <span>RH: {observation?.humidity}%</span>
          </div>
          <span className="text-[10px] text-emerald-500 mt-1 block">
            ✓ 100% Immutable Raw Storage Preserved
          </span>
        </div>

        <div className="skyguard-card p-5 border rounded-2xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Hybrid AI Fusion Score</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
              {anomaly.composite_score}
            </span>
            <StatusBadge status={anomaly.severity} type="severity" />
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Ensemble: QC ({anomaly.rule_score}%) + Stat ({anomaly.statistical_score}%) + ML ({anomaly.isolation_forest_score}%)
          </span>
        </div>
      </div>

      {/* Adaptive Verification Timeline (USP 2) */}
      <div className="skyguard-card p-5 border rounded-2xl space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-sky-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            ⭐ Adaptive Evidence Verification Timeline (USP 2)
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          The system gathers sequential evidentiary telemetry over multiple polling steps before committing to a final diagnosis.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {verification_timeline.length > 0 ? (
            verification_timeline.map((ev: any, i: number) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-600 dark:text-cyan-400 font-mono">
                    Step {ev.step}
                  </span>
                  <span className="text-[10px] text-slate-400">{new Date(ev.created_at).toLocaleTimeString()}</span>
                </div>
                <p className="mt-2 text-xs font-medium text-slate-800 dark:text-slate-200">
                  {ev.note}
                </p>
                <div className="mt-2 text-[11px] font-mono text-slate-500">
                  Divergence Index: {ev.divergence}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 text-center">
              Single-cycle transient trigger recorded.
            </div>
          )}
        </div>
      </div>

      {/* Consensus-Based Self-Healing Recovery (USP 3) */}
      {self_healing && self_healing.length > 0 && (
        <div className="skyguard-card p-5 border rounded-2xl space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              ⭐ Consensus-Based Self-Healing Recovery (USP 3)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1 font-mono text-xs">
            {self_healing.map((sh: any, idx: number) => (
              <React.Fragment key={idx}>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Model A: Temporal Lag</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block">
                    {sh.model_temporal}°C
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Model B: Diurnal Baseline</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block">
                    {sh.model_historical}°C
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Model C: Multivariate</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block">
                    {sh.model_multivariate}°C
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block uppercase">Consensus Value</span>
                  <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300 mt-1 block">
                    {sh.corrected_value ? `${sh.corrected_value}°C` : "WITHHELD"}
                  </span>
                  <span className="text-[10px] font-sans text-emerald-600 block mt-0.5">
                    {sh.agreement_percent}% Model Agreement
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Explainable AI Component */}
      {explanation && (
        <ProgressiveDisclosure
          simpleExplanation={explanation.explanations?.simple_explanation}
          operatorSummary={explanation.explanations?.operator_summary}
          researcherTelemetry={explanation.explanations?.researcher_telemetry}
          featureAttribution={explanation.explanations?.feature_attribution}
        />
      )}

    </div>
  );
};
