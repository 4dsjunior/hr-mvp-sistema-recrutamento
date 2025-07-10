// 🚨 CORREÇÃO: App.tsx - Arquivo Corrigido
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
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
          {/* Rota pública */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Rotas protegidas */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  {/* Dashboard */}
                  <Route index element={<DashboardPage />} />
                  
                  {/* Candidatos */}
                  <Route path="candidates" element={<CandidatesPage />} />
                  
                  {/* Vagas */}
                  <Route path="jobs" element={<JobsPage />} />
                  
                  {/* Pipeline de Candidaturas */}
                  <Route path="pipeline" element={<PipelinePage />} />
                  
                  {/* Relatórios */}
                  <Route path="reports" element={<ReportsPage />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Redirect para dashboard se logado */}
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
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;