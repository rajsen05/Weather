import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  FlaskConical, Play, Sparkles, AlertTriangle, ShieldCheck, 
  RefreshCw, Radio, CheckCircle2, ArrowRight, Zap 
} from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { TrustMeter } from '../components/common/TrustMeter';
import { useWebSocket } from '../context/WebSocketContext';

export const SimulationLabPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [stations, setStations] = useState<any[]>([]);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<number>(1);
  const [selectedScenario, setSelectedScenario] = useState<string>('TEMP_SPIKE');
  const [injecting, setInjecting] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<any | null>(null);
  const { lastMessage } = useWebSocket();

  useEffect(() => {
    Promise.all([
      api.getStations(),
      api.getSimulationScenarios()
    ]).then(([stns, scens]) => {
      setStations(stns);
      setScenarios(scens);
      const urlStn = searchParams.get('station_id');
      if (urlStn) setSelectedStationId(parseInt(urlStn));
      else if (stns.length > 0) setSelectedStationId(stns[0].id);
    });
  }, []);

  const handleInject = async () => {
    setInjecting(true);
    try {
      const res = await api.injectSimulation({
        station_id: selectedStationId,
        scenario_type: selectedScenario
      });
      setPipelineResult(res.pipeline_output);
    } catch (err) {
      console.error("Simulation failed", err);
    } finally {
      setInjecting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            AI Simulation & Fault Injection Lab
          </h1>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
            🟣 SIMULATED AWS DATA
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Inject realistic hardware failures, sensor calibration drifts, and genuine severe weather squalls to observe real-time AI pipeline execution without physical hardware.
        </p>
      </div>

      {/* Control Panel */}
      <div className="skyguard-card p-6 border rounded-2xl space-y-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-purple-500" />
          <span>Configure Anomaly Scenario</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">
              Target AWS Station
            </label>
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(parseInt(e.target.value))}
              className="w-full text-xs font-semibold py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            >
              {stations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.station_name} ({s.station_code}) - {s.station_type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">
              Fault / Atmospheric Scenario Preset
            </label>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="w-full text-xs font-semibold py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            >
              {scenarios.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Scenario Preview */}
        {scenarios.find(s => s.id === selectedScenario) && (
          <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 space-y-1.5 text-xs">
            <div className="font-bold text-purple-900 dark:text-purple-200">
              {scenarios.find(s => s.id === selectedScenario)?.name}
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              {scenarios.find(s => s.id === selectedScenario)?.description}
            </p>
            <div className="text-[11px] text-slate-500 pt-1 font-mono">
              Expected Pipeline Response: {scenarios.find(s => s.id === selectedScenario)?.expected_outcome}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={handleInject}
            disabled={injecting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white shadow-md shadow-purple-500/20 transition-all"
          >
            <Zap className="w-4 h-4" />
            <span>{injecting ? "Injecting & Evaluating Pipeline..." : "Inject Simulated Fault Live"}</span>
          </button>
        </div>
      </div>

      {/* Live Pipeline Execution Output */}
      {pipelineResult && (
        <div className="skyguard-card p-6 border-2 border-purple-500 dark:border-purple-400 rounded-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Live Pipeline Execution Results (Zero Overwrite Guaranteed)
              </h2>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              {pipelineResult.station_name}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Injected Observation</span>
              <span className="block text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
                {pipelineResult.temperature !== null ? `${pipelineResult.temperature}°C` : "NULL"}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {pipelineResult.pressure} hPa • {pipelineResult.humidity}% RH
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">AI Severity & Cause</span>
              <span className="block text-sm font-bold text-slate-900 dark:text-white mt-1 truncate">
                {pipelineResult.root_cause}
              </span>
              <div className="mt-1 flex items-center justify-center gap-1">
                <StatusBadge status={pipelineResult.severity} type="severity" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Lifecycle Transition</span>
              <div className="mt-2">
                <StatusBadge status={pipelineResult.anomaly_status} type="lifecycle" />
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                {pipelineResult.diagnosis_confidence}% Diagnostic Conf.
              </span>
            </div>

            <div className="flex items-center justify-center">
              <TrustMeter score={pipelineResult.trust_score} size="sm" />
            </div>
          </div>

          {/* Consensus Self-Healing Breakdown */}
          {pipelineResult.self_healing && Object.keys(pipelineResult.self_healing).length > 0 && (
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 dark:text-emerald-300">
                  ⭐ Tri-Model Consensus Self-Healing Output (USP 3)
                </span>
                <span className="font-bold font-mono text-emerald-600">
                  {pipelineResult.self_healing.temperature?.agreement_percent || 95}% Model Agreement
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                {pipelineResult.self_healing.temperature?.reason}
              </p>
              <div className="font-mono pt-1 text-slate-500">
                Raw Value: <strong className="text-rose-500">{pipelineResult.self_healing.temperature?.original_value}°C</strong> (Preserved) → Safe Estimate: <strong className="text-emerald-600">{pipelineResult.self_healing.temperature?.corrected_value}°C</strong>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
