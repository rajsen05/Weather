import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlayCircle, CheckCircle2, ArrowRight, Sparkles, ShieldCheck, 
  AlertTriangle, RefreshCw, Layers, Fingerprint, HeartPulse, FileText 
} from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { TrustMeter } from '../components/common/TrustMeter';
import confetti from 'canvas-confetti';

export const GuidedDemoPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [demoState, setDemoState] = useState<any>({
    temp: 31.2,
    pres: 1008.4,
    hum: 64.0,
    trust: 96.5,
    status: 'NORMAL',
    severity: 'NORMAL',
    cause: 'Nominal Operation',
    confidence: 98,
    fingerprintMatch: null,
    consensusEstimate: null,
    evidenceSteps: []
  });
  const [runningStep, setRunningStep] = useState(false);

  const steps = [
    {
      title: "1. Nominal Live Baseline Ingestion",
      desc: "System ingests current live meteorological stream for Safdarjung AWS (New Delhi). All parameters are thermodynamically balanced with 96.5/100 Weather Trust Score."
    },
    {
      title: "2. Transient Sensor Spike Injection (+44°C Jump)",
      desc: "Simulate electrical impulse surge on PT100 temperature probe (31.2°C → 75.2°C) while barometric pressure and relative humidity remain static."
    },
    {
      title: "3. AI Hybrid Detection & Adaptive Verification Trigger",
      desc: "Rule QC, Modified Z-score (4.8), and Isolation Forest flag observation. Lifecycle transitions to 'UNDER_VERIFICATION' to avoid premature classification."
    },
    {
      title: "4. Evidentiary Accumulation & Root Cause Diagnosis",
      desc: "Subsequent reading reverts to baseline. System confirms isolated hardware sensor spike (97% confidence) instead of genuine meteorological front."
    },
    {
      title: "5. Fault Fingerprint Library Match (USP 4)",
      desc: "Signature vector extracted and compared via Cosine Similarity. 94.2% match with FP-TEMP-SPIKE-01 (RTD Impulse Glitch)."
    },
    {
      title: "6. Tri-Model Consensus Self-Healing & Audit Ledger (USP 3)",
      desc: "Temporal Lag (31.2°C), Diurnal Baseline (31.0°C), and Multivariate Model (31.4°C) achieve 96.2% agreement. Safe estimate accepted; raw 75.2°C preserved 100% in audit ledger."
    }
  ];

  const handleNextStep = async () => {
    setRunningStep(true);
    const next = currentStep + 1;
    setCurrentStep(next);

    if (next === 1) {
      // Step 2: Inject Spike
      setDemoState({
        temp: 75.2,
        pres: 1008.4,
        hum: 64.0,
        trust: 18.0,
        status: 'UNDER_VERIFICATION',
        severity: 'CRITICAL',
        cause: 'Temperature Sensor Spike',
        confidence: 95,
        fingerprintMatch: null,
        consensusEstimate: null,
        evidenceSteps: ["Initial severe thermal divergence (+44.0°C) without barometric coupling."]
      });
    } else if (next === 2) {
      // Step 3: Anomaly Detected & Under Verification
      setDemoState((prev: any) => ({
        ...prev,
        evidenceSteps: [
          ...prev.evidenceSteps,
          "Cycle 2: Monitoring subsequent frame for atmospheric front coherence."
        ]
      }));
    } else if (next === 3) {
      // Step 4: Confirmed Sensor Anomaly
      setDemoState((prev: any) => ({
        ...prev,
        status: 'CONFIRMED_ANOMALY',
        confidence: 97,
        evidenceSteps: [
          ...prev.evidenceSteps,
          "Cycle 3: Reading reverted to baseline (31.3°C). Transient hardware spike confirmed."
        ]
      }));
    } else if (next === 4) {
      // Step 5: Fingerprint Match
      setDemoState((prev: any) => ({
        ...prev,
        fingerprintMatch: {
          code: 'FP-TEMP-SPIKE-01',
          type: 'Temperature Sensor Spike',
          similarity: 94.2,
          recommendation: 'Check RTD wiring harness and shield grounding.'
        }
      }));
    } else if (next === 5) {
      // Step 6: Self-Healing & Confetti
      setDemoState((prev: any) => ({
        ...prev,
        consensusEstimate: {
          modelA: 31.2,
          modelB: 31.0,
          modelC: 31.4,
          agreement: 96.2,
          consensus: 31.2,
          status: 'SAFE_ESTIMATE'
        }
      }));
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    setRunningStep(false);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setDemoState({
      temp: 31.2,
      pres: 1008.4,
      hum: 64.0,
      trust: 96.5,
      status: 'NORMAL',
      severity: 'NORMAL',
      cause: 'Nominal Operation',
      confidence: 98,
      fingerprintMatch: null,
      consensusEstimate: null,
      evidenceSteps: []
    });
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Guided SIH 2026 Interactive Demonstration
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-sm">
              Judge Evaluation Mode
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            One-click interactive guided narrative demonstrating the complete 13-stage intelligent weather trust & recovery pipeline.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Script</span>
        </button>
      </div>

      {/* Stepper Progress Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl border text-xs transition-all ${
              currentStep === idx
                ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-500 dark:border-cyan-400 shadow-md'
                : currentStep > idx
                ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-400'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold mb-1">
              {currentStep > idx ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px]">
                  {idx + 1}
                </span>
              )}
              <span className="truncate">Stage {idx + 1}</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block truncate">
              {s.title.split('.')[1]}
            </span>
          </div>
        ))}
      </div>

      {/* Current Step Narrative Card */}
      <div className="skyguard-card p-6 border-2 border-sky-500/80 dark:border-cyan-400/80 rounded-2xl bg-gradient-to-br from-sky-500/5 to-cyan-500/5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-500" />
            <span>{steps[currentStep]?.title}</span>
          </h2>
          <span className="text-xs font-mono font-bold text-sky-600 dark:text-cyan-400">
            Step {currentStep + 1} of 6
          </span>
        </div>

        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {steps[currentStep]?.desc}
        </p>

        {currentStep < 5 && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleNextStep}
              disabled={runningStep}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-sky-500 to-cyan-500 hover:brightness-110 text-white shadow-md shadow-sky-500/25 transition-all"
            >
              <span>Execute Next Stage ({currentStep + 2}/6)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Live State Visualizer Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Telemetry */}
        <div className="skyguard-card p-4 border rounded-2xl text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Live Temperature</span>
          <span className={`block text-3xl font-extrabold font-mono mt-1 ${demoState.temp > 50 ? 'text-rose-500 animate-pulse' : 'text-slate-900 dark:text-white'}`}>
            {demoState.temp}°C
          </span>
          <span className="text-[11px] font-mono text-slate-400 mt-1 block">
            Pres: {demoState.pres} hPa • RH: {demoState.hum}%
          </span>
        </div>

        {/* Anomaly & Lifecycle */}
        <div className="skyguard-card p-4 border rounded-2xl text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">AI Diagnosis & Status</span>
          <span className="block text-xs font-bold text-slate-900 dark:text-white mt-1">
            {demoState.cause}
          </span>
          <div className="mt-2 flex items-center justify-center gap-1">
            <StatusBadge status={demoState.status} type="lifecycle" />
          </div>
        </div>

        {/* Trust Score */}
        <div className="skyguard-card p-4 border rounded-2xl flex items-center justify-center">
          <TrustMeter score={demoState.trust} size="sm" />
        </div>

        {/* Fingerprint Match */}
        <div className="skyguard-card p-4 border rounded-2xl text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Fault Fingerprint (USP 4)</span>
          {demoState.fingerprintMatch ? (
            <div className="mt-1">
              <span className="font-bold text-xs text-purple-600 dark:text-purple-400 block font-mono">
                {demoState.fingerprintMatch.code}
              </span>
              <span className="text-xs font-extrabold text-emerald-500 block font-mono mt-0.5">
                {demoState.fingerprintMatch.similarity}% Similarity
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 block mt-2">Awaiting pattern match</span>
          )}
        </div>

      </div>

      {/* Consensus Self-Healing Output (USP 3) */}
      {demoState.consensusEstimate && (
        <div className="skyguard-card p-5 border-2 border-emerald-500 dark:border-emerald-400 rounded-2xl bg-emerald-50/20 dark:bg-emerald-950/20 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                ⭐ Consensus Self-Healing Auto-Recovery Activated (USP 3)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-300">
              {demoState.consensusEstimate.agreement}% Agreement
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono text-center">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border">
              <span className="text-[10px] text-slate-400 block">Model A (Temporal)</span>
              <span className="font-bold text-sm text-slate-900 dark:text-white">{demoState.consensusEstimate.modelA}°C</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border">
              <span className="text-[10px] text-slate-400 block">Model B (Diurnal)</span>
              <span className="font-bold text-sm text-slate-900 dark:text-white">{demoState.consensusEstimate.modelB}°C</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border">
              <span className="text-[10px] text-slate-400 block">Model C (Multivariate)</span>
              <span className="font-bold text-sm text-slate-900 dark:text-white">{demoState.consensusEstimate.modelC}°C</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500 text-white shadow-sm">
              <span className="text-[10px] text-white/80 block font-bold">Consensus Estimate</span>
              <span className="font-extrabold text-sm">{demoState.consensusEstimate.consensus}°C</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border text-xs flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-300">
              Raw Outlier: <strong className="line-through text-rose-500">75.2°C</strong> preserved immutably in DB • Corrected Value: <strong className="text-emerald-500">31.2°C</strong>
            </span>
            <Link to="/audit" className="font-bold text-sky-600 dark:text-cyan-400 hover:underline">
              Inspect Audit Ledger →
            </Link>
          </div>
        </div>
      )}

    </div>
  );
};
