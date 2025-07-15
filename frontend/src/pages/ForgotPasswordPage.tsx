// 🔐 NOVO: ForgotPasswordPage.tsx - Página de Recuperação de Senha
// Arquivo: frontend/src/pages/ForgotPasswordPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuth';
import { Mail, ArrowLeft, Users, CheckCircle } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { resetPassword } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Por favor, informe seu email');
      return;
    }
    
    // Validação de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Por favor, informe um email válido');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await resetPassword(email.trim());
      setSuccess(true);
    } catch (error: any) {
      console.error('Erro no reset de senha:', error);
      setError(error.message || 'Erro ao enviar email de recuperação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-green-600 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Email Enviado!</h2>
            <p className="mt-2 text-gray-600">Verifique sua caixa de entrada</p>
          </div>

          {/* Success Message */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-center mb-3">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Instruções enviadas!
                </h3>
                <p className="text-green-700 text-sm">
                  Enviamos um email com instruções para redefinir sua senha para:
                </p>
                <p className="text-green-800 font-semibold mt-2">
                  {email}
                </p>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <p>• Verifique sua caixa de entrada e spam</p>
                <p>• O link expira em 1 hora</p>
                <p>• Não recebeu? Tente novamente em alguns minutos</p>
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                    setError(null);
                  }}
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Tentar outro email
                </button>
                
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Voltar ao login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Recuperar Senha</h2>
          <p className="mt-2 text-gray-600">Digite seu email para receber instruções</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                placeholder="seu@email.com"
              />
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Você receberá um email com instruções para redefinir sua senha. 
                    Verifique também sua caixa de spam.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Mail className="h-5 w-5 mr-2" />
                  Enviar Email
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar ao login
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>MVP Sistema HR v2.0 - 95% Concluído</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;