import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Activity, Map, Radio, AlertTriangle,
  HeartPulse, Wrench, Sparkles, BrainCircuit, LineChart,
  FlaskConical, PlayCircle, Bell, FileText, Settings,
  ShieldAlert, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role } = useAuth();

  const navigationSections = [
    {
      title: "Real-Time Intelligence",
      items: [
        { to: "/dashboard", label: "Executive Dashboard", icon: LayoutDashboard },
        { to: "/live", label: "Live Weather & Stream", icon: Activity },
        { to: "/map", label: "AWS Geospatial Map", icon: Map },
        { to: "/stations", label: "Station Registry", icon: Radio },
      ]
    },
    {
      title: "AI Detection & Verification",
      items: [
        { to: "/anomalies", label: "Anomaly Center", icon: AlertTriangle },
        { to: "/explain", label: "Explainable AI (XAI)", icon: BrainCircuit },
        { to: "/self-healing", label: "Consensus Self-Healing", icon: Sparkles, badge: "USP" },
        { to: "/explorer", label: "Multi-Variable Explorer", icon: LineChart },
      ]
    },
    {
      title: "Sensor Health & Reliability",
      items: [
        { to: "/health", label: "Sensor Health Matrix", icon: HeartPulse },
        { to: "/maintenance", label: "Predictive Maintenance", icon: Wrench },
        { to: "/alerts", label: "Alerts Management", icon: Bell },
      ]
    },
    {
      title: "Innovation & Governance",
      items: [
        { to: "/demo", label: "Guided SIH Demo", icon: PlayCircle, badge: "1-Click" },
        { to: "/simulation", label: "AI Simulation Lab", icon: FlaskConical },
        { to: "/audit", label: "Observation Ledger", icon: ShieldCheck, badge: "Raw Data" },
        { to: "/reports", label: "Reports & Export", icon: FileText },
        { to: "/settings", label: "System Settings", icon: Settings },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 flex-shrink-0 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="py-4 px-3 space-y-6">
          {navigationSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {section.title}
              </h3>
              <div className="space-y-0.5 pt-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                          isActive
                            ? 'bg-sky-50 dark:bg-slate-800 text-sky-600 dark:text-cyan-400 font-semibold border-l-4 border-sky-500 dark:border-cyan-400'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-800">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Organization Badge */}
        <div className="p-3 m-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-sky-600 dark:text-cyan-400">
            <ShieldAlert className="w-4 h-4" />
            <span>SIH 2026 #SIH26073</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Ministry of Earth Sciences (MoES)
          </p>
        </div>
      </aside>
    </>
  );
};
