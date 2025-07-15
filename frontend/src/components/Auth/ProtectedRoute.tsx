// 🛡️ COMPONENTE DE PROTEÇÃO DE ROTAS
// Arquivo: frontend/src/components/Auth/ProtectedRoute.tsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// ============================================================================
// INTERFACES
// ============================================================================

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[]; // Roles necessários para acessar a rota
  redirectTo?: string; // Para onde redirecionar se não autorizado
}

// ============================================================================
// COMPONENTE DE LOADING
// ============================================================================

const AuthLoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">
        Verificando autenticação...
      </h2>
      <p className="text-gray-500">Aguarde um momento</p>
    </div>
  </div>
);

// ============================================================================
// COMPONENTE DE ACESSO NEGADO
// ============================================================================

const AccessDenied: React.FC<{ userRole?: string; requiredRoles: string[] }> = ({ 
  userRole, 
  requiredRoles 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md mx-auto text-center">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Acesso Negado
        </h1>
        
        <p className="text-gray-600 mb-6">
          Você não tem permissão para acessar esta página.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Seu nível:</strong> {userRole || 'Não identificado'}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Níveis necessários:</strong> {requiredRoles.join(', ')}
          </p>
        </div>
        
        <button
          onClick={() => window.history.back()}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Voltar
        </button>
      </div>
    </div>
  </div>
);

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  redirectTo = '/login'
}) => {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();
  const location = useLocation();

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return <AuthLoadingSpinner />;
  }

  // ============================================================================
  // NÃO AUTENTICADO
  // ============================================================================

  if (!isAuthenticated) {
    // Salvar a rota atual para redirecionar após login
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // ============================================================================
  // VERIFICAR ROLES (se especificadas)
  // ============================================================================

  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    return (
      <AccessDenied 
        userRole={user?.role} 
        requiredRoles={requiredRoles} 
      />
    );
  }

  // ============================================================================
  // AUTORIZADO - RENDERIZAR CONTEÚDO
  // ============================================================================

  return <>{children}</>;
};

export default ProtectedRoute;