'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { authService } from '@/services/authService';
import type { User, RegisterData } from '@/types/user';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  initialUser?: User | null;
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser || null);
  const [isLoading, setIsLoading] = useState(!initialUser); // Se já tem usuário inicial, não precisa carregar

  useEffect(() => {
    // Se já tem usuário inicial do SSR, não precisa buscar novamente
    if (initialUser) {
      return;
    }

    // Verificar se há token e carregar usuário
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token') || Cookies.get('access_token');
      if (token) {
        // Sincronizar cookie com localStorage se necessário
        if (!localStorage.getItem('access_token') && token) {
          localStorage.setItem('access_token', token);
        }
        // Sincronizar localStorage com cookie se necessário (para usuários já logados)
        if (localStorage.getItem('access_token') && !Cookies.get('access_token')) {
          const localToken = localStorage.getItem('access_token');
          const refreshToken = localStorage.getItem('refresh_token');
          if (localToken) {
            Cookies.set('access_token', localToken, {
              expires: 1,
              sameSite: 'lax',
              secure: false
            });
          }
          if (refreshToken) {
            Cookies.set('refresh_token', refreshToken, {
              expires: 7,
              sameSite: 'lax',
              secure: false
            });
          }
        }
        loadUser();
      } else {
        setIsLoading(false);
      }
    }
  }, [initialUser]);

  const loadUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const data = await authService.login(username, password);
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      // Também salvar em cookie para SSR
      Cookies.set('access_token', data.access, { 
        expires: 1, // 1 dia
        sameSite: 'lax', // Mais permissivo que 'strict' para funcionar em desenvolvimento
        secure: false // false em desenvolvimento para funcionar sem HTTPS
      });
      Cookies.set('refresh_token', data.refresh, {
        expires: 7, // 7 dias
        sameSite: 'lax',
        secure: false
      });
      await loadUser();
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await authService.register(data);
      // Após registro, fazer login automaticamente
      await login(data.username, data.password);
    } catch (error) {
      console.error('Erro ao registrar:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    // Remover cookies também
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

