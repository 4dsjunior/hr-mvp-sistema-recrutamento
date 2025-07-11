// 🚨 CORREÇÃO CRÍTICA: App.tsx - Sistema de Rotas Corrigido
// Arquivo: frontend/src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout
import Layout from './components/Layout/Layout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CandidatesPage from './pages/CandidatesPage';
import JobsPage from './pages/JobsPage';
import PipelinePage from './pages/PipelinePage';
import ReportsPage from './pages/ReportsPage';

// Hooks
import { useAuth } from './hooks/useAuth';

// Componente de rota protegida
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando sistema...</p>
        </div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rota pública - Login */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Rotas protegidas - Layout com Outlet */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            {/* Rotas filhas que serão renderizadas no <Outlet /> */}
            <Route index element={<DashboardPage />} />
            <Route path="candidates" element={<CandidatesPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="pipeline" element={<PipelinePage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>
          
          {/* Redirect qualquer rota não encontrada */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* Toast notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              style: {
                background: '#10b981',
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#10b981',
              },
            },
            error: {
              style: {
                background: '#ef4444',
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#ef4444',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;