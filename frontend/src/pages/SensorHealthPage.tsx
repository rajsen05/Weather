import React, { useState, useEffect } from 'react';
import { HeartPulse, Wrench, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { api } from '../services/api';

export const SensorHealthPage: React.FC = () => {
  const [matrix, setMatrix] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getHealthMatrix().then((data) => {
      setMatrix(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Sensor Health & Transducer Reliability Matrix
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Dynamic transducer physical health degradation tracking, drift detection & failure prediction across all AWS nodes.
        </p>
      </div>

      {/* Grid of Station Health Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matrix.map((stn) => (
          <div key={stn.station_id} className="skyguard-card p-5 border rounded-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {stn.station_name}
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  {stn.station_code} • {stn.state}
                </span>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                stn.overall_status === 'HEALTHY' 
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' 
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
              }`}>
                {stn.overall_status}
              </span>
            </div>

            {/* Individual Sensors Health */}
            <div className="space-y-3">
              {['TEMPERATURE', 'PRESSURE', 'HUMIDITY'].map((stype) => {
                const sData = stn.sensors?.[stype] || { score: 95, risk: 'LOW', degradation: 0.1 };
                const score = Math.round(sData.score);
                
                let barColor = 'bg-emerald-500';
                if (score < 50) barColor = 'bg-rose-500';
                else if (score < 80) barColor = 'bg-amber-500';

                return (
                  <div key={stype} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {stype === 'TEMPERATURE' ? 'PT100 Temperature Probe' : (stype === 'PRESSURE' ? 'Barometric Transducer' : 'Capacitive Hygrometer')}
                      </span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {score}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`${barColor} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${score}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                      <span>Risk: <strong>{sData.risk}</strong></span>
                      <span>Degradation: {sData.degradation} pts/wk</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
