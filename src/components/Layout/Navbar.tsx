'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '../Common/Button';
import { useState } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const getDisplayName = () => {
    if (!user) return '';
    
    // Se tem nome e sobrenome, mostra nome completo
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    
    // Se tem apenas nome, mostra só o nome
    if (user.first_name) {
      return user.first_name;
    }
    
    // Caso contrário, mostra o username
    return user.username;
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🎬</span>
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              AnimeVerse
            </span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`transition-colors ${
                isActive('/') ? 'text-purple-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              Início
            </Link>
            <Link
              href="/animes"
              className={`transition-colors ${
                isActive('/animes') ? 'text-purple-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              Animes
            </Link>
            <Link
              href="/mangas"
              className={`transition-colors ${
                pathname.startsWith('/mangas') ? 'text-purple-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              Mangas
            </Link>
            {isAuthenticated && (
              <Link
                href="/minha-area"
                className={`transition-colors ${
                  isActive('/minha-area')
                    ? 'text-purple-400'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Minha Área
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="relative group">
                  <button className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1">
                    <span>👤 {getDisplayName()}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <Link
                        href="/usuario/perfil"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        Meu Perfil
                      </Link>
                      <Link
                        href="/minha-area"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        Minha Área
                      </Link>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={logout}>
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Entrar
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Registrar
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-700 py-4">
            <div className="flex flex-col space-y-4 px-4">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`transition-colors ${
                  isActive('/') ? 'text-purple-400' : 'text-gray-300 hover:text-white'
                }`}
              >
                Início
              </Link>
              <Link
                href="/animes"
                onClick={() => setMobileMenuOpen(false)}
                className={`transition-colors ${
                  isActive('/animes') ? 'text-purple-400' : 'text-gray-300 hover:text-white'
                }`}
              >
                Animes
              </Link>
              <Link
                href="/mangas"
                onClick={() => setMobileMenuOpen(false)}
                className={`transition-colors ${
                  pathname.startsWith('/mangas') ? 'text-purple-400' : 'text-gray-300 hover:text-white'
                }`}
              >
                Mangas
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    href="/minha-area"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`transition-colors ${
                      isActive('/minha-area')
                        ? 'text-purple-400'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Minha Área
                  </Link>
                  <Link
                    href="/usuario/perfil"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`transition-colors ${
                      pathname.startsWith('/usuario/perfil')
                        ? 'text-purple-400'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    👤 Meu Perfil
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                    Sair
                  </Button>
                </>
              )}
              {!isAuthenticated && (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      Entrar
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full">
                      Registrar
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

