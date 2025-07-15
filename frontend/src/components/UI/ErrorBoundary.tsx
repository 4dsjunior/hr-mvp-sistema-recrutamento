// 🛡️ NOVO: ErrorBoundary.tsx - Componente de Tratamento de Erros
// Arquivo: frontend/src/components/UI/ErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              {/* Icon */}
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Oops! Algo deu errado
              </h1>

              {/* Description */}
              <p className="text-gray-600 mb-6">
                Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver o problema.
              </p>

              {/* Error Details (só em desenvolvimento) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                  <p className="text-red-800 font-semibold text-sm mb-2">
                    Detalhes do erro (desenvolvimento):
                  </p>
                  <pre className="text-red-700 text-xs overflow-auto max-h-32">
                    {this.state.error.toString()}
                  </pre>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={this.handleReload}
                  className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Recarregar Página
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="w-full flex items-center justify-center py-3 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Ir para Início
                </button>
              </div>

              {/* Support Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Se o problema persistir, entre em contato com o suporte técnico
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;