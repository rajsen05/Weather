import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-6 px-6 text-center text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 dark:text-slate-200">SKYGUARD AI</span>
          <span>•</span>
          <span>Smart India Hackathon 2026</span>
          <span>•</span>
          <span className="text-sky-600 dark:text-cyan-400 font-semibold">SIH26073</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Data Provider: <strong>Open-Meteo API</strong></span>
          <span>Target: <strong>India Meteorological Department (IMD) / MoES</strong></span>
          <span>Architecture: <strong>Zero Overwrite / Provenance Preserved</strong></span>
        </div>
      </div>
    </footer>
  );
};
