'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '../Common/Button';
import { Input } from '../Common/Input';

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Credenciais inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-gray-800 rounded-lg p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Login</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Usuário"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Digite seu usuário"
            required
            autoComplete="username"
          />

          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite sua senha"
            required
            autoComplete="current-password"
          />

          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-500 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Entrar
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Não tem uma conta?{' '}
            <Link href="/register" className="text-purple-400 hover:text-purple-300">
              Registre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

