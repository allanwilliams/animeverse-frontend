import api from './api';
import type { User, LoginData, LoginResponse, RegisterData } from '@/types/user';

export const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login/', { username, password });
    return response.data;
  },

  register: async (data: RegisterData): Promise<User> => {
    const response = await api.post<User>('/auth/register/', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    if (typeof window !== 'undefined') {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          await api.post('/auth/logout/', { refresh: refreshToken });
        } catch (error) {
          console.error('Erro ao fazer logout:', error);
        }
      }
    }
  },

  getCurrentUser: async (): Promise<User> => {
    // Usar API route do Next.js para ocultar a rota do backend
    const response = await api.get<User>('/api/auth/perfil');
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
    const response = await api.post<{ access: string }>('/auth/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },
};

