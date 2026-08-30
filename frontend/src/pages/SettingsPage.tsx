import React, { useState } from 'react';
import { Settings, ShieldCheck, Database, Radio, Sliders, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [provider, setProvider] = useState('open_meteo');
  const [refreshInterval, setRefreshInterval] = useState(60);
  const [consensusThreshold, setConsensusThreshold] = useState(85);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          System & Model Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Adjust live weather provider routing, polling rates, and AI threshold parameters.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Weather Provider Configuration */}
        <div className="skyguard-card p-6 border rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-sky-500" />
            <span>Meteorological Data Ingestion Providers</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-sky-500/50 bg-sky-50/30 dark:bg-sky-950/20 cursor-pointer">
              <input
                type="radio"
                name="provider"
                value="open_meteo"
                checked={provider === 'open_meteo'}
                onChange={(e) => setProvider(e.target.value)}
                className="mt-1"
              />
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                  Open-Meteo API (Primary Global Ingestion)
                </span>
                <span className="text-[11px] text-slate-500">
                  Global high-resolution WMO-compliant meteorological model. Active (No key required).
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer">
              <input
                type="radio"
                name="provider"
                value="imd"
                checked={provider === 'imd'}
                onChange={(e) => setProvider(e.target.value)}
                className="mt-1"
              />
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                  India Meteorological Department (IMD Official AWS)
                </span>
                <span className="text-[11px] text-slate-500">
                  Direct official AWS access (Configurable via IMD_API_KEY / IMD_ENDPOINT).
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer">
              <input
                type="radio"
                name="provider"
                value="open_weather"
                checked={provider === 'open_weather'}
                onChange={(e) => setProvider(e.target.value)}
                className="mt-1"
              />
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                  OpenWeatherMap API
                </span>
                <span className="text-[11px] text-slate-500">
                  Secondary global provider (Configurable via OPENWEATHER_API_KEY).
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* AI & Polling Parameters */}
        <div className="skyguard-card p-6 border rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-500" />
            <span>AI Pipeline & Ingestion Polling Rates</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">
                Background Ingestion Interval (Seconds)
              </label>
              <input
                type="number"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                min={10}
                max={600}
                className="w-full text-xs font-mono py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">
                Consensus Self-Healing Threshold (% Agreement)
              </label>
              <input
                type="number"
                value={consensusThreshold}
                onChange={(e) => setConsensusThreshold(parseInt(e.target.value))}
                min={60}
                max={99}
                className="w-full text-xs font-mono py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings synchronized successfully!</span>
            </span>
          ) : <div />}

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-sky-500 hover:bg-sky-600 text-white shadow-sm transition-all"
          >
            Save Configurations
          </button>
        </div>

      </form>

    </div>
  );
};
