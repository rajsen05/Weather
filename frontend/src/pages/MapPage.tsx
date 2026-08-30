import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Radio, ShieldCheck, Activity, Search } from 'lucide-react';
import { api } from '../services/api';
import { LiveWeatherCardData } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

// Custom Leaflet DivIcon factory for animated status markers
const createCustomIcon = (status: string) => {
  let color = '#10B981'; // Green
  if (status === 'CRITICAL') color = '#EF4444'; // Red
  else if (status === 'DEGRADED' || status === 'HIGH') color = '#F97316'; // Orange
  else if (status === 'WATCH' || status === 'SUSPICIOUS') color = '#F59E0B'; // Yellow

  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 10px ${color};
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 6px; height: 6px; background-color: white; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

export const MapPage: React.FC = () => {
  const [stations, setStations] = useState<LiveWeatherCardData[]>([]);
  const [selectedStation, setSelectedStation] = useState<LiveWeatherCardData | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    api.getLiveCards().then((data) => {
      setStations(data);
      if (data.length > 0) setSelectedStation(data[0]);
    });
  }, []);

  const filteredStations = stations.filter((s) => {
    if (filterStatus === 'ALL') return true;
    return s.anomaly_severity === filterStatus || s.anomaly_status === filterStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            AWS Geospatial Network Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time geospatial visualization of Indian and Global Automatic Weather Stations (AWS).
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {['ALL', 'NORMAL', 'WATCH', 'HIGH', 'CRITICAL'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                filterStatus === st
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-cyan-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Map Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Leaflet Map Canvas */}
        <div className="lg:col-span-3 skyguard-card border rounded-2xl overflow-hidden h-[540px] z-10 relative">
          <MapContainer
            center={[22.5937, 78.9629]}
            zoom={5}
            style={{ width: '100%', height: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredStations.map((station) => (
              <Marker
                key={station.station_id}
                position={[station.latitude, station.longitude]}
                icon={createCustomIcon(station.anomaly_severity)}
                eventHandlers={{
                  click: () => setSelectedStation(station)
                }}
              >
                <Popup>
                  <div className="p-2 space-y-1.5 text-xs text-slate-900 font-sans min-w-[180px]">
                    <div className="font-bold text-sm text-sky-700">{station.station_name}</div>
                    <div className="text-[11px] text-slate-500">{station.state}, {station.country}</div>
                    <div className="pt-2 border-t space-y-1 font-mono">
                      <div>Temp: <strong>{station.temperature}°C</strong></div>
                      <div>Pres: <strong>{station.pressure} hPa</strong></div>
                      <div>RH: <strong>{station.humidity}%</strong></div>
                      <div>Trust: <strong>{station.trust_score}/100</strong></div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Selected Station Telemetry Card */}
        <div className="space-y-4">
          <div className="skyguard-card p-5 border rounded-2xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Station Quick Inspector
            </h3>

            {selectedStation ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-sky-500" />
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">
                      {selectedStation.station_name}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedStation.state}, {selectedStation.country}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <StatusBadge status={selectedStation.anomaly_status} type="lifecycle" />
                  <span className="text-xs font-bold text-sky-600 dark:text-cyan-400 font-mono">
                    {selectedStation.latitude.toFixed(2)}°N, {selectedStation.longitude.toFixed(2)}°E
                  </span>
                </div>

                <div className="space-y-2 py-3 border-y border-slate-100 dark:border-slate-800 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Temperature</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedStation.temperature}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Atm. Pressure</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedStation.pressure} hPa</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rel. Humidity</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedStation.humidity}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Data Freshness</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedStation.data_age_seconds}s</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 block mb-1">Weather Trust Score</span>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                    <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-cyan-400">
                      {selectedStation.trust_score}/100
                    </span>
                    <span className="text-xs font-bold uppercase text-emerald-500">
                      {selectedStation.trust_category}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Click a marker on the map to inspect telemetry.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
