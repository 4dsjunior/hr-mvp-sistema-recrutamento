// 🚨 CORREÇÃO: useAuth.ts - Hook de Autenticação com Logout Funcional
// Arquivo: frontend/src/hooks/useAuth.ts

import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão atual
    const getCurrentSession = async () => {
      try {
        console.log('🔍 Verificando sessão atual...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Erro ao obter sessão:', error);
          throw error;
        }

        console.log('📋 Sessão atual:', session ? 'Existe' : 'Não existe');
        
        setSession(session);
        setUser(session?.user ?? null);
        
      } catch (error) {
        console.error('❌ Erro na verificação de sessão:', error);
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getCurrentSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('🔄 Mudança de estado de auth:', event, session ? 'com sessão' : 'sem sessão');
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Logs para debug
        if (event === 'SIGNED_IN') {
          console.log('✅ Usuário logado:', session?.user?.email);
          toast.success(`Bem-vindo! ${session?.user?.email}`);
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 Usuário deslogado');
          toast.success('Logout realizado com sucesso');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      console.log('🔐 Tentando fazer login com:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        console.error('❌ Erro no login:', error);
        
        // Mensagens de erro específicas
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha incorretos');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Email não confirmado. Verifique sua caixa de entrada.');
        } else {
          throw new Error(error.message);
        }
      }

      if (!data.user) {
        throw new Error('Erro inesperado no login');
      }

      console.log('✅ Login realizado com sucesso:', data.user.email);
      
      // O estado será atualizado automaticamente pelo onAuthStateChange
      
    } catch (error: any) {
      console.error('❌ Erro no signIn:', error);
      toast.error(error.message || 'Erro ao fazer login');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log('🚪 Iniciando logout...');

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('❌ Erro no logout:', error);
        throw error;
      }

      console.log('✅ Logout realizado com sucesso');
      
      // Limpar estado local imediatamente
      setUser(null);
      setSession(null);
      
      // O onAuthStateChange também será chamado, mas já limpamos aqui
      
    } catch (error: any) {
      console.error('❌ Erro no signOut:', error);
      toast.error('Erro ao fazer logout');
      
      // Mesmo com erro, limpar estado local
      setUser(null);
      setSession(null);
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = !!user && !!session;

  return {
    user,
    session,
    loading,
    signIn,
    signOut,
    isAuthenticated
  };
};

// Provider (opcional - se você quiser usar Context)
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o context (opcional)
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};