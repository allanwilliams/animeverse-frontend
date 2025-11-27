import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para detectar rotas de API do Next.js e usar URL relativa
api.interceptors.request.use((config) => {
  // Se a URL começar com /api/, usar URL relativa (Next.js API routes)
  if (config.url?.startsWith('/api/')) {
    config.baseURL = ''; // URL relativa ao domínio atual
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para adicionar token JWT
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token') || Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refresh_token') || Cookies.get('refresh_token');
        
        if (refreshToken) {
          try {
            const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
              refresh: refreshToken,
            });
            
            localStorage.setItem('access_token', response.data.access);
            // Sincronizar com cookie também
            Cookies.set('access_token', response.data.access, {
              expires: 1,
              sameSite: 'lax',
              secure: false
            });
            originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
            
            return api(originalRequest);
          } catch (err) {
            // Token refresh falhou, limpar tokens e redirecionar
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            Cookies.remove('access_token');
            Cookies.remove('refresh_token');
            
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

