'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '../Common/Button';
import { Input } from '../Common/Input';
import type { RegisterData } from '@/types/user';

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password2) {
      setError('As senhas não coincidem');
      return;
    }

    setIsLoading(true);

    try {
      await register(formData);
      router.push('/');
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.response?.data?.username?.[0] || err.response?.data?.email?.[0] || 'Erro ao registrar';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof RegisterData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-gray-800 rounded-lg p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Registrar</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Usuário"
            type="text"
            value={formData.username}
            onChange={(e) => handleChange('username', e.target.value)}
            placeholder="Escolha um nome de usuário"
            required
          />

          <Input
            label="E-mail"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="seu@email.com"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nome"
              type="text"
              value={formData.first_name || ''}
              onChange={(e) => handleChange('first_name', e.target.value)}
              placeholder="Nome"
            />

            <Input
              label="Sobrenome"
              type="text"
              value={formData.last_name || ''}
              onChange={(e) => handleChange('last_name', e.target.value)}
              placeholder="Sobrenome"
            />
          </div>

          <Input
            label="Senha"
            type="password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="Crie uma senha forte"
            required
          />

          <Input
            label="Confirmar Senha"
            type="password"
            value={formData.password2}
            onChange={(e) => handleChange('password2', e.target.value)}
            placeholder="Repita sua senha"
            required
          />

          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-500 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Criar Conta
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-purple-400 hover:text-purple-300">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

