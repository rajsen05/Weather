import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, Radio, Activity, Clock, ShieldCheck, 
  MapPin, RefreshCw, AlertTriangle, Thermometer, Gauge, Droplets, ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { LiveWeatherCardData, LocationSearchResult } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { TrustMeter } from '../components/common/TrustMeter';
import { useWebSocket } from '../context/WebSocketContext';

export const LiveMonitoringPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [cards, setCards] = useState<LiveWeatherCardData[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [activeSearchedLocation, setActiveSearchedLocation] = useState<any | null>(null);
  const { lastMessage } = useWebSocket();

  const loadLiveCards = async () => {
    try {
      const data = await api.getLiveCards();
      setCards(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load live cards', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveCards();
    if (searchParams.get('search')) {
      handleSearch(searchParams.get('search')!);
    }
  }, []);

  // Update live on WebSocket message
  useEffect(() => {
    if (lastMessage && (lastMessage.type === 'LIVE_OBSERVATION' || lastMessage.type === 'SIMULATION_INJECTED')) {
      loadLiveCards();
    }
  }, [lastMessage]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const results = await api.searchLocations(query);
      setSearchResults(results);
      setSearching(false);
    } catch (err) {
      console.error('Search failed', err);
      setSearching(false);
    }
  };

  const handleSelectLocation = async (loc: LocationSearchResult) => {
    setLoading(true);
    setSearchResults([]);
    try {
      const weatherData = await api.getWeatherByCoordinates(loc.latitude, loc.longitude, `${loc.name}, ${loc.country || ''}`);
      setActiveSearchedLocation(weatherData);
      loadLiveCards();
    } catch (err) {
      console.error('Failed to fetch coordinate weather', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Live Meteorological Stream
            </h1>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              LIVE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Official Open-Meteo & Automatic Weather Stations real-time sensor observations and trust classification.
          </p>
        </div>

        <button
          onClick={loadLiveCards}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh All</span>
        </button>
      </div>

      {/* Global Location Search Bar */}
      <div className="skyguard-card p-4 border rounded-2xl relative">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(searchQuery);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any location in India or globally (e.g., Shimla, Pune, London, 28.58, 77.20)..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-5 py-2 text-xs sm:text-sm font-bold rounded-xl bg-sky-500 hover:bg-sky-600 text-white transition-all"
          >
            {searching ? 'Searching...' : 'Find Weather'}
          </button>
        </form>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-30 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 space-y-1 max-h-60 overflow-y-auto">
            {searchResults.map((res, i) => (
              <button
                key={i}
                onClick={() => handleSelectLocation(res)}
                className="w-full text-left p-2.5 rounded-xl hover:bg-sky-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-sky-500" />
                  <span className="font-bold text-slate-900 dark:text-white">
                    {res.name}
                  </span>
                  <span className="text-slate-500">
                    {res.admin1 ? `${res.admin1}, ` : ''}{res.country}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">
                  {res.latitude.toFixed(2)}°N, {res.longitude.toFixed(2)}°E
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Searched Location Inspection Highlight */}
      {activeSearchedLocation && (
        <div className="skyguard-card p-6 border-2 border-sky-500 dark:border-cyan-400 rounded-2xl bg-sky-50/20 dark:bg-sky-950/20">
          <div className="flex items-center justify-between border-b border-sky-200 dark:border-sky-800/60 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-sky-500 animate-bounce" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Live Query Result: {activeSearchedLocation.station_name}
              </h2>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500 text-white font-bold">
              INGESTED TO PIPELINE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Temperature</span>
              <span className="block text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
                {activeSearchedLocation.temperature}°C
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Atm. Pressure</span>
              <span className="block text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
                {activeSearchedLocation.pressure} hPa
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Relative Humidity</span>
              <span className="block text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
                {activeSearchedLocation.humidity}%
              </span>
            </div>
            <div className="flex items-center justify-center">
              <TrustMeter score={activeSearchedLocation.trust_score} size="sm" />
            </div>
          </div>
        </div>
      )}

      {/* Grid of All Stations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.station_id} className="skyguard-card p-5 border rounded-2xl flex flex-col justify-between space-y-4">
            
            {/* Card Header */}
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-sky-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {card.station_name}
                  </h3>
                </div>
                <StatusBadge status={card.anomaly_status} type="lifecycle" />
              </div>
              
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                <span>{card.state ? `${card.state}, ` : ''}{card.country}</span>
                <span className="font-mono text-slate-400">{card.latitude.toFixed(2)}°N, {card.longitude.toFixed(2)}°E</span>
              </div>
            </div>

            {/* Weather Parameters */}
            <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-100 dark:border-slate-800 text-center">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Temp</span>
                <span className="text-lg font-extrabold font-mono text-slate-900 dark:text-white mt-0.5 block">
                  {card.temperature !== null ? `${card.temperature}°C` : "--"}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Pressure</span>
                <span className="text-lg font-extrabold font-mono text-slate-900 dark:text-white mt-0.5 block">
                  {card.pressure !== null ? `${card.pressure}` : "--"}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Humidity</span>
                <span className="text-lg font-extrabold font-mono text-slate-900 dark:text-white mt-0.5 block">
                  {card.humidity !== null ? `${card.humidity}%` : "--"}
                </span>
              </div>
            </div>

            {/* Trust Meter and Provenance */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <div className="text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Trust: {card.trust_score}/100
                  </span>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                    {card.trust_category}
                  </span>
                </div>
              </div>

              <div className="text-right text-[10px] text-slate-500">
                <div className="flex items-center gap-1 justify-end">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Age: {card.data_age_seconds}s</span>
                </div>
                <span className="text-slate-400">Source: {card.provider}</span>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
