import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Activity, BrainCircuit, Sparkles, Fingerprint, 
  ArrowRight, CheckCircle2, Radio, PlayCircle, MapPin, 
  Thermometer, Gauge, Droplets, Clock, AlertTriangle, Layers
} from 'lucide-react';
import { api } from '../services/api';
import { LiveWeatherCardData } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { TrustMeter } from '../components/common/TrustMeter';

export const LandingPage: React.FC = () => {
  const [liveCards, setLiveCards] = useState<LiveWeatherCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLiveCards()
      .then((data) => {
        setLiveCards(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load landing live cards", err);
        setLoading(false);
      });
  }, []);

  const featuredCard = liveCards[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,240,255,0.15),rgba(15,23,42,0))]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            
            {/* Hackathon Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-cyan-400 border border-sky-200 dark:border-cyan-800/80 mb-6">
              <Radio className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
              <span>Smart India Hackathon 2026 • MoES / IMD • SIH26073</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
              SKYGUARD <span className="bg-gradient-to-r from-sky-500 to-cyan-400 bg-clip-text text-transparent">AI</span>
            </h1>
            
            <p className="mt-3 text-lg sm:text-xl font-semibold text-slate-700 dark:text-slate-300">
              "From Raw Weather Data to Trusted Weather Intelligence"
            </p>

            <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              AI-powered real-time anomaly detection, multi-observation evidence verification, 
              consensus-based self-healing, and meteorological trust scoring for Automatic Weather Stations (AWS).
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/25 transition-all"
              >
                <span>Launch Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/demo"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-sky-600 hover:brightness-110 text-white shadow-lg shadow-cyan-500/20 transition-all"
              >
                <PlayCircle className="w-4 h-4" />
                <span>1-Click SIH Guided Demo</span>
              </Link>

              <Link
                to="/live"
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-cyan-400 text-slate-800 dark:text-slate-200 transition-all"
              >
                <Activity className="w-4 h-4 text-sky-500" />
                <span>Explore Live Weather</span>
              </Link>
            </div>
          </div>

          {/* Real-time Hero Weather Card (Fetched from Open-Meteo) */}
          {featuredCard && (
            <div className="mt-14 max-w-4xl mx-auto skyguard-card p-6 border rounded-2xl relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-slate-900 dark:text-white">
                        {featuredCard.station_name}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                        LIVE OPEN-METEO STREAM
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Latitude: {featuredCard.latitude}°N | Longitude: {featuredCard.longitude}°E
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500">Data Age: {featuredCard.data_age_seconds}s</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6 items-center">
                <div className="text-center md:text-left">
                  <span className="text-xs font-bold text-slate-400 uppercase">Temperature</span>
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                    <Thermometer className="w-6 h-6 text-amber-500" />
                    <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                      {featuredCard.temperature !== null ? `${featuredCard.temperature}°C` : "--"}
                    </span>
                  </div>
                </div>

                <div className="text-center md:text-left">
                  <span className="text-xs font-bold text-slate-400 uppercase">Atm. Pressure</span>
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                    <Gauge className="w-6 h-6 text-sky-500" />
                    <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                      {featuredCard.pressure !== null ? `${featuredCard.pressure} hPa` : "--"}
                    </span>
                  </div>
                </div>

                <div className="text-center md:text-left">
                  <span className="text-xs font-bold text-slate-400 uppercase">Relative Humidity</span>
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                    <Droplets className="w-6 h-6 text-cyan-500" />
                    <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                      {featuredCard.humidity !== null ? `${featuredCard.humidity}%` : "--"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0">
                  <TrustMeter score={featuredCard.trust_score} size="sm" />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. Four Flagship Innovations (USPs) */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-cyan-400">
            Pioneering Innovations
          </h2>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            Beyond Simple Anomaly Detection
          </p>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            SkyGuard AI introduces a scientifically responsible, multi-stage meteorological reliability framework.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* USP 1 */}
          <div className="skyguard-card p-6 rounded-2xl border transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-cyan-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-sky-600 dark:text-cyan-400 uppercase tracking-wider">USP 1</div>
            <h3 className="text-base font-bold mt-1 text-slate-900 dark:text-white">Weather Trust Score</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Composite credibility metric (0–100) factoring QC validity, temporal stability, thermodynamic coupling, and sensor degradation.
            </p>
          </div>

          {/* USP 2 */}
          <div className="skyguard-card p-6 rounded-2xl border transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">USP 2</div>
            <h3 className="text-base font-bold mt-1 text-slate-900 dark:text-white">Adaptive Verification</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Multi-cycle verification window that distinguishes genuine atmospheric squalls/fronts from isolated hardware sensor glitches.
            </p>
          </div>

          {/* USP 3 */}
          <div className="skyguard-card p-6 rounded-2xl border transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">USP 3</div>
            <h3 className="text-base font-bold mt-1 text-slate-900 dark:text-white">Consensus Self-Healing</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Tri-model agreement (Temporal, Diurnal, Multivariate) auto-recovers faulty readings ONLY when models agree, never overwriting raw values.
            </p>
          </div>

          {/* USP 4 */}
          <div className="skyguard-card p-6 rounded-2xl border transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">USP 4</div>
            <h3 className="text-base font-bold mt-1 text-slate-900 dark:text-white">Fault Fingerprint Memory</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Vectorized failure signature extraction with Cosine similarity matching against historical sensor failure profiles.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Scientific Workflow Pipeline */}
      <section className="py-16 bg-white dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-cyan-400">
              End-to-End Pipeline
            </h2>
            <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
              The 13-Stage Meteorological Intelligence Chain
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-mono">
            {[
              "Raw Ingest", "Data QC", "Feature Eng", "Hybrid ML", "Fusion",
              "Verification", "Trust Score", "Diagnosis", "Fingerprint", "Health",
              "Consensus Healing", "XAI", "Audit Ledger"
            ].map((step, idx) => (
              <React.Fragment key={idx}>
                <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold">
                  {idx + 1}. {step}
                </div>
                {idx < 12 && <ArrowRight className="w-4 h-4 text-sky-500 hidden md:block" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
