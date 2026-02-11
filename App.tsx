
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import AlertCenter from './pages/AlertCenter';
import ElderlyManagement from './pages/ElderlyManagement';
import GuardianManagement from './pages/GuardianManagement';
import DeviceManagement from './pages/DeviceManagement';
import MapTracking from './pages/MapTracking';
import Settings from './pages/Settings';
import HealthReport from './pages/HealthReport';
import History from './pages/History';
import Login from './pages/Login';
import RequireAuth from './components/RequireAuth';
import ErrorBoundary from './components/ErrorBoundary';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<RequireAuth />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/alerts" element={<AlertCenter />} />
              <Route path="/elderly" element={<ElderlyManagement />} />
              <Route path="/guardians" element={<GuardianManagement />} />
              <Route path="/devices" element={<DeviceManagement />} />
              <Route path="/map" element={<MapTracking />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/health-report/:id" element={<HealthReport />} />
              <Route path="/history" element={<History />} />
              <Route path="/history/:id" element={<History />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </ErrorBoundary >
  );
};

export default App;
