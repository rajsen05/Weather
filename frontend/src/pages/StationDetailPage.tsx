import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Radio, ArrowLeft, Thermometer, Gauge, Droplets, 
  ShieldCheck, HeartPulse, Wrench, AlertTriangle 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { api } from '../services/api';
import { Station } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { TrustMeter } from '../components/common/TrustMeter';

export const StationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [station, setStation] = useState<Station | null>(null);
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const stationId = parseInt(id);
      Promise.all([
        api.getStationById(stationId),
        api.getStationSeries(stationId, 30)
      ]).then(([stn, ser]) => {
        setStation(stn);
        setSeries(ser);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading || !station) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      
      {/* Back button & Station Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/stations"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {station.station_name}
              </h1>
              <StatusBadge status={station.status} type="severity" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Code: <span className="font-mono font-bold text-sky-600 dark:text-cyan-400">{station.station_code}</span> • {station.state}, {station.country} • Elevation: {station.elevation}m
            </p>
          </div>
        </div>

        <Link
          to={`/simulation?station_id=${station.id}`}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-sky-500 hover:bg-sky-600 text-white shadow-sm transition-all"
        >
          Simulate Fault on this Station
        </Link>
      </div>

      {/* Current Observations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="skyguard-card p-4 border rounded-2xl flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
            <Thermometer className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Temperature</span>
            <span className="block text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">
              {station.latest_reading?.temperature !== null ? `${station.latest_reading?.temperature}°C` : "--"}
            </span>
          </div>
        </div>

        <div className="skyguard-card p-4 border rounded-2xl flex items-center gap-3">
          <div className="p-3 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Atm. Pressure</span>
            <span className="block text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">
              {station.latest_reading?.pressure !== null ? `${station.latest_reading?.pressure} hPa` : "--"}
            </span>
          </div>
        </div>

        <div className="skyguard-card p-4 border rounded-2xl flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Relative Humidity</span>
            <span className="block text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">
              {station.latest_reading?.humidity !== null ? `${station.latest_reading?.humidity}%` : "--"}
            </span>
          </div>
        </div>

        <div className="skyguard-card p-4 border rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Weather Trust</span>
            <span className="block text-2xl font-extrabold font-mono text-slate-900 dark:text-cyan-400 mt-0.5">
              {station.latest_trust_score || 98}/100
            </span>
          </div>
          <TrustMeter score={station.latest_trust_score || 98} size="sm" />
        </div>
      </div>

      {/* Historical Telemetry Chart */}
      <div className="skyguard-card p-5 border rounded-2xl">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
          Time-Series Observation Telemetry
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="timestamp" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1E293B', 
                  borderColor: '#334155', 
                  borderRadius: '0.75rem',
                  color: '#F8FAFC' 
                }} 
              />
              <Area type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#0EA5E9" fill="#0EA5E9" fillOpacity={0.2} />
              <Area type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
