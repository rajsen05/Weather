import React, { useState } from 'react';
import { ChevronDown, ChevronUp, User, Wrench, Microscope, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ProgressiveDisclosureProps {
  simpleExplanation: string;
  operatorSummary?: string;
  researcherTelemetry?: any;
  featureAttribution?: Array<{
    feature: string;
    importance_percent: number;
    impact: string;
  }>;
}

export const ProgressiveDisclosure: React.FC<ProgressiveDisclosureProps> = ({
  simpleExplanation,
  operatorSummary,
  researcherTelemetry,
  featureAttribution
}) => {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<'simple' | 'operator' | 'researcher'>(
    role === 'RESEARCHER' ? 'researcher' : role === 'OPERATOR' || role === 'MAINTENANCE' ? 'operator' : 'simple'
  );
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-all">
      {/* Header with Persona Tabs */}
      <div className="flex flex-wrap items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-500" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Explainable AI (XAI) Progressive Disclosure
          </h4>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('simple')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'simple'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-cyan-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Citizen</span>
          </button>

          <button
            onClick={() => setActiveTab('operator')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'operator'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-cyan-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>AWS Operator</span>
          </button>

          <button
            onClick={() => setActiveTab('researcher')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'researcher'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-cyan-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Microscope className="w-3.5 h-3.5" />
            <span>Meteorologist</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'simple' && (
          <div className="p-4 rounded-xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/50">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
              {simpleExplanation}
            </p>
          </div>
        )}

        {activeTab === 'operator' && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Diagnostic Verdict</span>
              <p className="mt-1 text-xs text-slate-700 dark:text-slate-200 font-mono">
                {operatorSummary || "All systems nominal. No corrective work order required."}
              </p>
            </div>

            {/* Feature Attribution Bar Chart */}
            {featureAttribution && featureAttribution.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Feature Contribution Weights</span>
                <div className="space-y-1.5">
                  {featureAttribution.map((f, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-300 w-1/2 truncate">{f.feature}</span>
                      <div className="w-1/3 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mx-2">
                        <div
                          className="bg-cyan-500 h-full rounded-full"
                          style={{ width: `${f.importance_percent}%` }}
                        />
                      </div>
                      <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 text-right w-12">{f.importance_percent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'researcher' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-950 text-cyan-400 font-mono text-[11px] overflow-x-auto">
              <pre>{JSON.stringify(researcherTelemetry || { message: "Nominal operational telemetry" }, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
