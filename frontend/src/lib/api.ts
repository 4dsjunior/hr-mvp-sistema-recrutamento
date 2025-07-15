import axios from 'axios';
import { supabase } from './supabase';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação do Supabase
api.interceptors.request.use(
  async (config) => {
    try {
      // Obter token atual do Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
        console.log('🔑 Token adicionado à requisição:', config.url);
      } else {
        console.log('⚠️ Nenhum token encontrado para:', config.url);
      }
    } catch (error) {
      console.error('❌ Erro ao obter token:', error);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com respostas
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log('🚫 Token expirado/inválido - fazendo logout...');
      
      // Fazer logout do Supabase
      await supabase.auth.signOut();
      
      // Redirecionar para login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;