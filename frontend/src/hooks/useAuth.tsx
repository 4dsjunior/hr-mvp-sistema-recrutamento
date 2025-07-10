// 🎯 CORREÇÃO: useAuth.ts - Hook de Autenticação
// Arquivo: frontend/src/hooks/useAuth.ts

import { useState, useEffect, createContext, useContext } from 'react';

// Tipos para o usuário
interface User {
  id: string;
  email: string;
  name?: string;
}

// Tipos para o contexto de autenticação
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Hook para usar o contexto de autenticação
export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar se há usuário salvo no localStorage
  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedUser = localStorage.getItem('hr_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        localStorage.removeItem('hr_user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Função de login
  const signIn = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    
    try {
      // Simulação de autenticação (substitua pela sua lógica real)
      if (email === 'admin@teste.com' && password === '123456') {
        const userData: User = {
          id: '1',
          email: email,
          name: 'Administrador'
        };
        
        setUser(userData);
        localStorage.setItem('hr_user', JSON.stringify(userData));
      } else {
        throw new Error('Email ou senha incorretos');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const signOut = async (): Promise<void> => {
    setLoading(true);
    
    try {
      setUser(null);
      localStorage.removeItem('hr_user');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    signIn,
    signOut
  };
};

// Context (se você quiser usar Context API no futuro)
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default useAuth;