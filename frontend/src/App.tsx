// 🚨 CORREÇÃO CRÍTICA: App.tsx - Sistema de Rotas Corrigido
// Arquivo: frontend/src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout
import Layout from './components/Layout/Layout';

// Components
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ErrorBoundary from './components/UI/ErrorBoundary';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import CandidatesPage from './pages/CandidatesPage';
import JobsPage from './pages/JobsPage';
import PipelinePage from './pages/PipelinePage';
import ReportsPage from './pages/ReportsPage';

// Hooks - não precisamos mais do useAuthContext aqui
// import { useAuthContext } from './hooks/useAuth';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
        <Routes>
          {/* Rotas públicas - Login, Registro e Recuperação */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
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
    </ErrorBoundary>
  );
}

export default App;