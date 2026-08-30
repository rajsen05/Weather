import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Radio, Search, Filter, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';
import { api } from '../services/api';
import { Station } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

export const StationsPage: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStations().then((data) => {
      setStations(data);
      setLoading(false);
    });
  }, []);

  const filtered = stations.filter((s) => {
    const matchesSearch = s.station_name.toLowerCase().includes(search.toLowerCase()) ||
                          s.station_code.toLowerCase().includes(search.toLowerCase()) ||
                          (s.state && s.state.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === 'ALL' || s.station_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Automatic Weather Station Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Registered IMD & MoES AWS observation nodes and virtual testing rigs.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by station name or code..."
              className="pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs font-semibold py-1.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">All Station Types</option>
            <option value="LIVE_LOCATION">Live AWS Locations</option>
            <option value="SIMULATED_AWS">Simulated AWS Testing Rig</option>
          </select>
        </div>
      </div>

      {/* Stations Table / Cards */}
      <div className="skyguard-card border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Station Code / Name</th>
                <th className="p-4">Coordinates / State</th>
                <th className="p-4">Latest Ingestion</th>
                <th className="p-4">Trust Score</th>
                <th className="p-4">Sensor Health</th>
                <th className="p-4">Anomaly Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((stn) => (
                <tr key={stn.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-cyan-400 flex items-center justify-center font-bold font-mono">
                        <Radio className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {stn.station_name}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {stn.station_code} • {stn.station_type}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 font-mono text-slate-600 dark:text-slate-300">
                    <div>{stn.latitude.toFixed(3)}°N, {stn.longitude.toFixed(3)}°E</div>
                    <div className="text-[11px] text-slate-400 font-sans">{stn.state}, {stn.country}</div>
                  </td>

                  <td className="p-4 font-mono">
                    {stn.latest_reading ? (
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {stn.latest_reading.temperature}°C
                        </span>
                        <span className="text-slate-400 text-[11px] block">
                          {stn.latest_reading.pressure} hPa • {stn.latest_reading.humidity}% RH
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">Awaiting stream</span>
                    )}
                  </td>

                  <td className="p-4">
                    <span className="font-bold font-mono text-slate-900 dark:text-cyan-400 text-sm">
                      {stn.latest_trust_score || 98}/100
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <HeartPulse className="w-4 h-4 text-emerald-500" />
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {stn.sensor_health_summary?.TEMPERATURE || 95}%
                      </span>
                    </div>
                  </td>

                  <td className="p-4">
                    <StatusBadge status={stn.latest_anomaly_status || "NORMAL"} type="lifecycle" />
                  </td>

                  <td className="p-4 text-right">
                    <Link
                      to={`/stations/${stn.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-50 dark:bg-slate-800 text-sky-600 dark:text-cyan-400 hover:bg-sky-100 transition-colors"
                    >
                      <span>Telemetry</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
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
