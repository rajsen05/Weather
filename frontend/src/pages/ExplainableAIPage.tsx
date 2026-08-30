import React, { useState, useEffect } from 'react';
import { BrainCircuit, Sparkles, Microscope, Wrench, User } from 'lucide-react';
import { api } from '../services/api';
import { ProgressiveDisclosure } from '../components/common/ProgressiveDisclosure';

export const ExplainableAIPage: React.FC = () => {
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<number | null>(null);
  const [explanation, setExplanation] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnomalies().then((data) => {
      setAnomalies(data);
      if (data.length > 0) {
        setSelectedAnomalyId(data[0].id);
        api.getAnomalyExplanation(data[0].id).then(setExplanation);
      }
      setLoading(false);
    });
  }, []);

  const handleSelectAnomaly = (id: number) => {
    setSelectedAnomalyId(id);
    api.getAnomalyExplanation(id).then(setExplanation);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Explainable AI (XAI) Laboratory
          </h1>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-cyan-400 border border-sky-200 dark:border-cyan-800">
            Progressive Disclosure
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          SHAP feature contribution attributions, ensemble decision reasoning, and plain-English natural language translations tailored to user persona.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Anomaly Selector List */}
        <div className="skyguard-card p-4 border rounded-2xl space-y-2 h-[500px] overflow-y-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Select Observation to Explain
          </span>
          {anomalies.map((anom) => (
            <button
              key={anom.id}
              onClick={() => handleSelectAnomaly(anom.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                selectedAnomalyId === anom.id
                  ? 'bg-sky-50 dark:bg-slate-800 border-sky-500 dark:border-cyan-400 shadow-sm'
                  : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">
                  Anomaly #{anom.id}
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  {new Date(anom.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <span className="text-slate-600 dark:text-slate-300 mt-1">
                {anom.probable_cause}
              </span>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="font-mono text-sky-600 dark:text-cyan-400 font-bold">
                  Score: {anom.composite_score}
                </span>
                <span className="text-emerald-500 font-semibold">{anom.confidence}% Conf.</span>
              </div>
            </button>
          ))}
        </div>

        {/* Explainable AI Details Container */}
        <div className="lg:col-span-2 space-y-6">
          {explanation ? (
            <ProgressiveDisclosure
              simpleExplanation={explanation.explanations?.simple_explanation}
              operatorSummary={explanation.explanations?.operator_summary}
              researcherTelemetry={explanation.explanations?.researcher_telemetry}
              featureAttribution={explanation.explanations?.feature_attribution}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-400 text-xs">
              Select an anomaly event to inspect SHAP feature attributions.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
