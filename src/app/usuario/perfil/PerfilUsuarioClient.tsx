'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/Common/Button';
import { useRouter } from 'next/navigation';

interface PerfilData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface PasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export function PerfilUsuarioClient() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [perfilData, setPerfilData] = useState<PerfilData>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [activeTab, setActiveTab] = useState<'dados' | 'senha'>('dados');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      setPerfilData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
      });
    }
  }, [user, isAuthenticated, router]);

  const handlePerfilSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1];

      const response = await fetch('/api/usuario/perfil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: perfilData.email,
          first_name: perfilData.first_name,
          last_name: perfilData.last_name,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Dados atualizados com sucesso!' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Erro ao atualizar dados' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' });
      return;
    }

    if (passwordData.new_password.length < 8) {
      setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 8 caracteres' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1];

      const response = await fetch('/api/usuario/senha', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: '',
        });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Erro ao alterar senha' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Meu Perfil</h1>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('dados')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dados'
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                Dados Pessoais
              </button>
              <button
                onClick={() => setActiveTab('senha')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'senha'
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                Alterar Senha
              </button>
            </nav>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-900 border border-green-700 text-green-100' 
              : 'bg-red-900 border border-red-700 text-red-100'
          }`}>
            {message.text}
          </div>
        )}

        {/* Dados Pessoais Tab */}
        {activeTab === 'dados' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Dados Pessoais</h2>
            <form onSubmit={handlePerfilSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                    Nome de usuário
                    <span className="text-xs text-gray-500 ml-2">(não editável)</span>
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={perfilData.username}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-gray-300 cursor-not-allowed"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={perfilData.email}
                    onChange={(e) => setPerfilData({ ...perfilData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-300 mb-2">
                    Nome
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    value={perfilData.first_name}
                    onChange={(e) => setPerfilData({ ...perfilData, first_name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-300 mb-2">
                    Sobrenome
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    value={perfilData.last_name}
                    onChange={(e) => setPerfilData({ ...perfilData, last_name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Alterar Senha Tab */}
        {activeTab === 'senha' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Alterar Senha</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label htmlFor="current_password" className="block text-sm font-medium text-gray-300 mb-2">
                  Senha atual
                </label>
                <input
                  type="password"
                  id="current_password"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="new_password" className="block text-sm font-medium text-gray-300 mb-2">
                    Nova senha
                  </label>
                  <input
                    type="password"
                    id="new_password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-gray-400 mt-1">Mínimo de 8 caracteres</p>
                </div>

                <div>
                  <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-300 mb-2">
                    Confirmar nova senha
                  </label>
                  <input
                    type="password"
                    id="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                >
                  {loading ? 'Alterando...' : 'Alterar Senha'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
