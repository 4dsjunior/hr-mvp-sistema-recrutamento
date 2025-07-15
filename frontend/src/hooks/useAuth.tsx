// 🔧 CORREÇÃO: useAuth.tsx - SEM mensagens repetitivas
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
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
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

    // ✅ CORREÇÃO: Escutar mudanças SEM toast repetitivo
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('🔄 Mudança de estado de auth:', event, session ? 'com sessão' : 'sem sessão');
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // ✅ CORREÇÃO: Só mostrar toast em eventos específicos (não INITIAL_SESSION)
        if (event === 'SIGNED_IN' && session) {
          console.log('✅ Usuário logado:', session.user.email);
          // ❌ REMOVIDO: toast bem-vindo repetitivo
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
      
      // ✅ CORREÇÃO: Toast de bem-vindo apenas no login manual
      toast.success(`Bem-vindo de volta!`);
      
    } catch (error: any) {
      console.error('❌ Erro no signIn:', error);
      toast.error(error.message || 'Erro ao fazer login');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string): Promise<void> => {
    try {
      setLoading(true);
      console.log('👤 Tentando registrar usuário:', email);

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
          }
        }
      });

      if (error) {
        console.error('❌ Erro no registro:', error);
        
        if (error.message.includes('User already registered')) {
          throw new Error('Email já está em uso');
        } else if (error.message.includes('Password should be at least 6 characters')) {
          throw new Error('A senha deve ter pelo menos 6 caracteres');
        } else if (error.message.includes('Unable to validate email address')) {
          throw new Error('Email inválido');
        } else {
          throw new Error(error.message);
        }
      }

      if (!data.user) {
        throw new Error('Erro inesperado no registro');
      }

      console.log('✅ Usuário registrado com sucesso:', data.user.email);
      
      // Verificar se precisa de confirmação de email
      if (data.user && !data.session) {
        toast.success('Conta criada! Verifique seu email para ativá-la.');
      } else {
        toast.success('Conta criada com sucesso!');
      }
      
    } catch (error: any) {
      console.error('❌ Erro no signUp:', error);
      toast.error(error.message || 'Erro ao criar conta');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      setLoading(true);
      console.log('🔄 Iniciando reset de senha para:', email);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('❌ Erro no reset de senha:', error);
        
        if (error.message.includes('Unable to validate email address')) {
          throw new Error('Email inválido');
        } else if (error.message.includes('Email not found')) {
          throw new Error('Email não encontrado');
        } else {
          throw new Error(error.message);
        }
      }

      console.log('✅ Email de reset enviado com sucesso');
      toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.');
      
    } catch (error: any) {
      console.error('❌ Erro no resetPassword:', error);
      toast.error(error.message || 'Erro ao enviar email de recuperação');
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
      
      setUser(null);
      setSession(null);
      
    } catch (error: any) {
      console.error('❌ Erro no signOut:', error);
      toast.error('Erro ao fazer logout');
      
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
    signUp,
    signOut,
    resetPassword,
    isAuthenticated
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};