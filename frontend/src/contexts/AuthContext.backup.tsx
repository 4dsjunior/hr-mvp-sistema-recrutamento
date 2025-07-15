// 🔐 BACKUP: AuthContext.tsx - Sistema Backend Custom (PRESERVADO)
// Arquivo: frontend/src/contexts/AuthContext.backup.tsx
// NOTA: Este arquivo foi mantido como backup das funcionalidades de roles e backend

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'recruiter' | 'user';
  department?: string;
  created_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role?: string;
}

export interface AuthContextType {
  // Estado
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  
  // Ações
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  
  // Utilitários
  hasRole: (roles: string[]) => boolean;
  isAdmin: boolean;
  isManager: boolean;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextType | null>(null);

// ============================================================================
// CONFIGURAÇÃO DO AXIOS
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Estado derivado
  const isAuthenticated = !!user && !!token;
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager' || isAdmin;

  // ============================================================================
  // CONFIGURAR INTERCEPTADORES DO AXIOS
  // ============================================================================

  useEffect(() => {
    // Interceptador para adicionar token nos requests
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptador para tratar respostas 401 (token expirado)
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && token) {
          console.warn('🔒 Token expirado ou inválido, fazendo logout...');
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  // ============================================================================
  // CARREGAR DADOS DO LOCAL STORAGE
  // ============================================================================

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = localStorage.getItem('hr_token');
        const storedUser = localStorage.getItem('hr_user');

        if (storedToken && storedUser) {
          const userData = JSON.parse(storedUser);
          
          // Verificar se o token ainda é válido
          try {
            api.defaults.headers.Authorization = `Bearer ${storedToken}`;
            const response = await api.get('/auth/profile');
            
            if (response.status === 200) {
              setToken(storedToken);
              setUser(response.data.user);
              console.log('✅ Sessão restaurada:', response.data.user.email);
            } else {
              // Token inválido, limpar storage
              localStorage.removeItem('hr_token');
              localStorage.removeItem('hr_user');
            }
          } catch (error) {
            // Token inválido, limpar storage
            localStorage.removeItem('hr_token');
            localStorage.removeItem('hr_user');
            console.warn('⚠️ Token inválido no localStorage, removido');
          }
        }
      } catch (error) {
        console.error('❌ Erro ao carregar autenticação:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  // ============================================================================
  // FUNÇÃO DE LOGIN
  // ============================================================================

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);

      const response = await api.post('/auth/login', credentials);

      if (response.status === 200) {
        const { access_token, user: userData } = response.data;

        // Salvar no estado
        setToken(access_token);
        setUser(userData);

        // Salvar no localStorage
        localStorage.setItem('hr_token', access_token);
        localStorage.setItem('hr_user', JSON.stringify(userData));

        console.log('✅ Login realizado:', userData.email);

        return { success: true };
      } else {
        return { success: false, error: 'Erro inesperado no login' };
      }
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      
      const errorMessage = error.response?.data?.error || 'Erro ao fazer login';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // FUNÇÃO DE REGISTRO
  // ============================================================================

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);

      const response = await api.post('/auth/register', data);

      if (response.status === 201) {
        console.log('✅ Usuário registrado:', data.email);
        
        // Após registrar, fazer login automaticamente
        const loginResult = await login({
          email: data.email,
          password: data.password
        });

        return loginResult;
      } else {
        return { success: false, error: 'Erro inesperado no registro' };
      }
    } catch (error: any) {
      console.error('❌ Erro no registro:', error);
      
      const errorMessage = error.response?.data?.error || 'Erro ao registrar usuário';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // FUNÇÃO DE LOGOUT
  // ============================================================================

  const logout = () => {
    try {
      // Fazer logout no backend (sem aguardar resposta)
      if (token) {
        api.post('/auth/logout').catch(console.warn);
      }

      // Limpar estado local
      setUser(null);
      setToken(null);

      // Limpar localStorage
      localStorage.removeItem('hr_token');
      localStorage.removeItem('hr_user');

      // Limpar header do axios
      delete api.defaults.headers.Authorization;

      console.log('✅ Logout realizado');
    } catch (error) {
      console.warn('⚠️ Erro no logout:', error);
    }
  };

  // ============================================================================
  // FUNÇÃO DE ATUALIZAR PERFIL
  // ============================================================================

  const updateProfile = async (data: Partial<User>) => {
    try {
      setIsLoading(true);

      const response = await api.put('/auth/profile', data);

      if (response.status === 200) {
        const updatedUser = response.data.user;
        
        setUser(updatedUser);
        localStorage.setItem('hr_user', JSON.stringify(updatedUser));

        console.log('✅ Perfil atualizado');
        return { success: true };
      } else {
        return { success: false, error: 'Erro ao atualizar perfil' };
      }
    } catch (error: any) {
      console.error('❌ Erro ao atualizar perfil:', error);
      
      const errorMessage = error.response?.data?.error || 'Erro ao atualizar perfil';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // FUNÇÃO DE VERIFICAR ROLES
  // ============================================================================

  const hasRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  // ============================================================================
  // VALOR DO CONTEXT
  // ============================================================================

  const value: AuthContextType = {
    // Estado
    user,
    isAuthenticated,
    isLoading,
    token,
    
    // Ações
    login,
    register,
    logout,
    updateProfile,
    
    // Utilitários
    hasRole,
    isAdmin,
    isManager,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================================
// HOOK CUSTOMIZADO
// ============================================================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};

// ============================================================================
// EXPORTAR INSTÂNCIA DO AXIOS CONFIGURADA
// ============================================================================

export { api };

export default AuthProvider;