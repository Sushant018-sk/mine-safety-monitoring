import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login      from './pages/Login';
import Layout     from './components/Layout';
import Dashboard  from './pages/Dashboard';
import LiveMonitor from './pages/LiveMonitor';
import Alerts     from './pages/Alerts';
import Workers    from './pages/Workers';
import Incidents  from './pages/Incidents';
import Mines      from './pages/Mines';
import DemoPanel  from './pages/DemoPanel';

// Wrapper — redirects to /login if not logged in
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index           element={<Dashboard />} />
            <Route path="live"     element={<LiveMonitor />} />
            <Route path="alerts"   element={<Alerts />} />
            <Route path="workers"  element={<Workers />} />
            <Route path="incidents"element={<Incidents />} />
            <Route path="mines"    element={<Mines />} />
            <Route path="demo"     element={<DemoPanel />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
