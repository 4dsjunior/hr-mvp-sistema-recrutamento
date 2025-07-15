// 🔧 CORREÇÃO: LoginPage.tsx - SEM dados de teste
// Arquivo: frontend/src/pages/LoginPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuth';
import { Eye, EyeOff, LogIn, Users } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuthContext();

  // Carregar email lembrado no mount do componente
  useEffect(() => {
    const rememberedData = localStorage.getItem('hr_remember_data');
    if (rememberedData) {
      try {
        const { email: savedEmail, timestamp } = JSON.parse(rememberedData);
        // Verificar se não expirou (30 dias)
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
        if (Date.now() - timestamp < thirtyDaysInMs) {
          setEmail(savedEmail);
          setRememberMe(true);
        } else {
          // Expirou, remover dados
          localStorage.removeItem('hr_remember_data');
        }
      } catch (error) {
        // Dados corrompidos, remover
        localStorage.removeItem('hr_remember_data');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações melhoradas
    if (!email.trim()) {
      setError('Por favor, informe seu email');
      return;
    }
    
    if (!password) {
      setError('Por favor, informe sua senha');
      return;
    }
    
    // Validação de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Por favor, informe um email válido');
      return;
    }
    
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await signIn(email.trim(), password);
      
      // Gerenciar dados do "Lembrar-me"
      if (rememberMe) {
        const rememberData = {
          email: email.trim(),
          timestamp: Date.now()
        };
        localStorage.setItem('hr_remember_data', JSON.stringify(rememberData));
      } else {
        localStorage.removeItem('hr_remember_data');
      }
      
      navigate('/', { replace: true });
    } catch (error: any) {
      console.error('Erro no login:', error);
      setError(error.message || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">HR System</h2>
          <p className="mt-2 text-gray-600">Sistema de Recrutamento e Seleção</p>
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
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Seu email de acesso"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-10"
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                Esqueci minha senha
              </button>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Lembrar-me neste dispositivo
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* Registration Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Novo no sistema?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Criar conta
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>MVP Sistema HR v2.0 - 95% Concluído</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;