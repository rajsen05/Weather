import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Sun, Moon, Radio, Search, UserCheck, 
  Menu, X, Bell, Compass, PlayCircle, Database 
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';
import { UserRole } from '../../types';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, role, switchRole } = useAuth();
  const { isConnected } = useWebSocket();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/live?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        
        {/* Left: Brand Logo & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-sky-600 to-cyan-600 dark:from-sky-400 dark:to-cyan-300 bg-clip-text text-transparent">
                  SKYGUARD AI
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-cyan-400 border border-sky-200 dark:border-cyan-800/60">
                  MoES / IMD
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Weather Trust & Anomaly Intelligence Platform
              </p>
            </div>
          </Link>
        </div>

        {/* Middle: Global City & Station Search Bar */}
        <div className="hidden md:flex items-center max-w-md w-full mx-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Indian AWS station, city, or coordinates..."
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-cyan-400 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>
        </div>

        {/* Right: Telemetry Controls & Profiles */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Guided Demo Launch Button */}
          <Link
            to="/demo"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-cyan-500 to-sky-600 text-white hover:brightness-110 shadow-sm transition-all"
          >
            <PlayCircle className="w-4 h-4" />
            <span>SIH Demo</span>
          </Link>

          {/* WebSocket Live Stream Indicator */}
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            title={isConnected ? "Real-time WebSocket Live Stream Active" : "Connecting to Live Stream..."}
          >
            <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
            <span className="hidden xl:inline">{isConnected ? "LIVE STREAM" : "RECONNECTING"}</span>
          </div>

          {/* Role Persona Switcher for SIH Evaluation */}
          <div className="relative group">
            <select
              value={role}
              onChange={(e) => switchRole(e.target.value as UserRole)}
              className="text-xs font-semibold py-1.5 pl-2 pr-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-cyan-300 border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
              title="Switch user perspective to evaluate progressive disclosure"
            >
              <option value="VIEWER">General Citizen</option>
              <option value="OPERATOR">AWS Operator</option>
              <option value="RESEARCHER">Meteorologist</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light Clear Sky' : 'Dark Command'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

        </div>
      </div>
    </header>
  );
};
