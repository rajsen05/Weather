import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { Footer } from './components/common/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { LiveMonitoringPage } from './pages/LiveMonitoringPage';
import { MapPage } from './pages/MapPage';
import { StationsPage } from './pages/StationsPage';
import { StationDetailPage } from './pages/StationDetailPage';
import { AnomaliesPage } from './pages/AnomaliesPage';
import { AnomalyDetailPage } from './pages/AnomalyDetailPage';
import { SensorHealthPage } from './pages/SensorHealthPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { SelfHealingPage } from './pages/SelfHealingPage';
import { ExplainableAIPage } from './pages/ExplainableAIPage';
import { DataExplorerPage } from './pages/DataExplorerPage';
import { SimulationLabPage } from './pages/SimulationLabPage';
import { GuidedDemoPage } from './pages/GuidedDemoPage';
import { AlertsPage } from './pages/AlertsPage';
import { AuditLedgerPage } from './pages/AuditLedgerPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { AdminPage } from './pages/AdminPage';

const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex w-full">
        {!isLanding && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        
        <main className={`flex-1 ${isLanding ? 'w-full' : 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full'}`}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/live" element={<LiveMonitoringPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/stations" element={<StationsPage />} />
            <Route path="/stations/:id" element={<StationDetailPage />} />
            <Route path="/anomalies" element={<AnomaliesPage />} />
            <Route path="/anomalies/:id" element={<AnomalyDetailPage />} />
            <Route path="/health" element={<SensorHealthPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/self-healing" element={<SelfHealingPage />} />
            <Route path="/explain" element={<ExplainableAIPage />} />
            <Route path="/explorer" element={<DataExplorerPage />} />
            <Route path="/simulation" element={<SimulationLabPage />} />
            <Route path="/demo" element={<GuidedDemoPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/audit" element={<AuditLedgerPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WebSocketProvider>
          <Router>
            <AppLayout />
          </Router>
        </WebSocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
