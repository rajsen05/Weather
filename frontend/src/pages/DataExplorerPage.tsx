import React, { useState, useEffect } from 'react';
import { LineChart, Filter, Download, Calendar, ArrowDownUp } from 'lucide-react';
import { ResponsiveContainer, LineChart as RechartsLine, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { api } from '../services/api';

export const DataExplorerPage: React.FC = () => {
  const [stations, setStations] = useState<any[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<number>(1);
  const [series, setSeries] = useState<any[]>([]);
  const [limit, setLimit] = useState<number>(30);

  useEffect(() => {
    api.getStations().then((data) => {
      setStations(data);
      if (data.length > 0) setSelectedStationId(data[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedStationId) {
      api.getStationSeries(selectedStationId, limit).then(setSeries);
    }
  }, [selectedStationId, limit]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Multi-Variable Historical Data Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Query and analyze historical time-series correlations across temperature, pressure, relative humidity, and trust score metrics.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <select
            value={selectedStationId}
            onChange={(e) => setSelectedStationId(parseInt(e.target.value))}
            className="text-xs font-semibold py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.station_name} ({s.station_code})
              </option>
            ))}
          </select>

          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            className="text-xs font-semibold py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <option value={15}>Past 15 Cycles</option>
            <option value={30}>Past 30 Cycles</option>
            <option value={60}>Past 60 Cycles</option>
          </select>
        </div>
      </div>

      {/* Explorer Chart */}
      <div className="skyguard-card p-6 border rounded-2xl">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
          Atmospheric Parameter Correlations
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLine data={series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="timestamp" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1E293B', 
                  borderColor: '#334155', 
                  borderRadius: '0.75rem',
                  color: '#F8FAFC' 
                }} 
              />
              <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#0EA5E9" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="pressure" name="Pressure (hPa)" stroke="#10B981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#F59E0B" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="trust_score" name="Trust Score" stroke="#8B5CF6" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            </RechartsLine>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
