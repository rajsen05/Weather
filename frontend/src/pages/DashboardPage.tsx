import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, AlertTriangle, ShieldCheck, HeartPulse, 
  Wrench, Radio, Clock, RefreshCw, ArrowUpRight, CheckCircle2 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';
import { api } from '../services/api';
import { DashboardSummaryData, LiveWeatherCardData } from '../types';
import { KPICard } from '../components/common/KPICard';
import { StatusBadge } from '../components/common/StatusBadge';
import { TrustMeter } from '../components/common/TrustMeter';
import { useWebSocket } from '../context/WebSocketContext';

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummaryData | null>(null);
  const [liveCards, setLiveCards] = useState<LiveWeatherCardData[]>([]);
  const [seriesData, setSeriesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { lastMessage } = useWebSocket();

  const loadData = async () => {
    try {
      const [sum, cards] = await Promise.all([
        api.getDashboardSummary(),
        api.getLiveCards()
      ]);
      setSummary(sum);
      setLiveCards(cards);

      if (cards.length > 0) {
        const series = await api.getStationSeries(cards[0].station_id, 24);
        setSeriesData(series);
      }
      setLoading(false);
      setRefreshing(false);
    } catch (err) {
      console.error("Error loading dashboard data", err);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update real-time on WebSocket event
  useEffect(() => {
    if (lastMessage && (lastMessage.type === "LIVE_OBSERVATION" || lastMessage.type === "SIMULATION_INJECTED")) {
      loadData();
    }
  }, [lastMessage]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Connecting to Meteorological Intelligence Hub...</p>
        </div>
      </div>
    );
  }

  const pieColors = ['#10B981', '#F59E0B', '#EF4444'];
  const pieData = Object.entries(summary.trust_category_distribution).map(([name, value]) => ({
    name, value
  }));

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Executive Intelligence Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time Automatic Weather Station (AWS) network telemetry, anomaly detection & trust analysis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-sky-500" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Sync Feeds"}</span>
          </button>

          <Link
            to="/simulation"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-sky-500 hover:bg-sky-600 text-white shadow-sm transition-all"
          >
            <span>Inject Test Scenario</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Monitored Stations"
          value={summary.total_stations}
          subtitle={`${summary.live_locations_count} Live • ${summary.simulated_stations_count} Sim Rig`}
          icon={Radio}
          colorScheme="sky"
        />

        <KPICard
          title="Active Anomalies"
          value={summary.active_anomalies_count}
          subtitle="Under active verification"
          icon={AlertTriangle}
          colorScheme={summary.active_anomalies_count > 0 ? "rose" : "emerald"}
          trend={{
            value: summary.active_anomalies_count > 0 ? "Needs Review" : "Nominal",
            isPositive: summary.active_anomalies_count === 0
          }}
        />

        <KPICard
          title="Avg Weather Trust"
          value={`${summary.avg_trust_score}%`}
          subtitle="Multi-factor reliability index"
          icon={ShieldCheck}
          colorScheme="cyan"
          trend={{
            value: summary.avg_trust_score >= 80 ? "High Credibility" : "Degraded",
            isPositive: summary.avg_trust_score >= 80
          }}
        />

        <KPICard
          title="Sensor Health"
          value={`${summary.healthy_sensors_percentage}%`}
          subtitle="Transducer physical health"
          icon={HeartPulse}
          colorScheme="emerald"
        />

        <KPICard
          title="Maintenance Risks"
          value={summary.maintenance_risks_count}
          subtitle="Predictive service alerts"
          icon={Wrench}
          colorScheme={summary.maintenance_risks_count > 0 ? "amber" : "emerald"}
        />
      </div>

      {/* Main Charts & Live Feed Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Multi-Parameter Timeline Chart */}
        <div className="lg:col-span-2 skyguard-card p-5 border rounded-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Multi-Variable Meteorological Telemetry (24-Hour)
              </h3>
              <p className="text-xs text-slate-500">
                Temperature (°C), Atmospheric Pressure (hPa) & Relative Humidity (%)
              </p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-cyan-400 font-mono font-bold">
              {liveCards[0]?.station_name || "Safdarjung AWS"}
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={seriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="humGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="timestamp" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    borderColor: '#334155', 
                    borderRadius: '0.75rem',
                    color: '#F8FAFC',
                    fontSize: '12px'
                  }} 
                />
                <Area type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#0EA5E9" strokeWidth={2.5} fillOpacity={1} fill="url(#tempGradient)" />
                <Area type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#humGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trust Distribution & Quick Diagnostics */}
        <div className="skyguard-card p-5 border rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
              Weather Trust Score Index
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Regional credibility classification breakdown
            </p>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center mt-2 text-xs">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="block font-bold text-emerald-600 dark:text-emerald-400 font-mono text-base">
                  {summary.trust_category_distribution.TRUSTED || 0}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Trusted</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <span className="block font-bold text-amber-600 dark:text-amber-400 font-mono text-base">
                  {summary.trust_category_distribution.UNCERTAIN || 0}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Uncertain</span>
              </div>
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                <span className="block font-bold text-rose-600 dark:text-rose-400 font-mono text-base">
                  {summary.trust_category_distribution.LOW_TRUST || 0}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Low Trust</span>
              </div>
            </div>
          </div>

          <Link
            to="/audit"
            className="mt-4 flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-all"
          >
            <span>View Immutable Audit Ledger</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

      {/* Live AWS Stations Telemetry Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Active Weather Stations Telemetry (Live Polling)
          </h2>
          <Link to="/stations" className="text-xs font-semibold text-sky-600 dark:text-cyan-400 hover:underline">
            View All Stations →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {liveCards.slice(0, 4).map((card) => (
            <div key={card.station_id} className="skyguard-card p-4 border rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {card.station_name}
                  </span>
                  <StatusBadge status={card.anomaly_status} type="lifecycle" />
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{card.state || card.country}</p>

                <div className="grid grid-cols-3 gap-2 my-3 py-2 border-y border-slate-100 dark:border-slate-800 text-center font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block">TEMP</span>
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      {card.temperature !== null ? `${card.temperature}°C` : "--"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">PRES</span>
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      {card.pressure !== null ? `${card.pressure}` : "--"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">RH</span>
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      {card.humidity !== null ? `${card.humidity}%` : "--"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-semibold text-slate-500">
                  Trust: <strong className="text-slate-900 dark:text-cyan-400">{card.trust_score}/100</strong>
                </span>
                <Link
                  to={`/stations/${card.station_id}`}
                  className="text-[11px] font-bold text-sky-600 dark:text-cyan-400 hover:underline"
                >
                  Inspect →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
