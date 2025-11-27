'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-800 border-t border-gray-700 mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-bold mb-4">AnimeVerse</h3>
            <p className="text-gray-400 text-sm">
              Seu portal completo para descobrir, acompanhar e avaliar seus animes favoritos.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Navegação</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/mangas" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Mangas
                </Link>
              </li>
              <li>
                <Link href="/minha-area" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Minha Área
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-semibold mb-4">Conta</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Registrar
                </Link>
              </li>
              <li>
                <Link href="/usuario/perfil" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Meu Perfil
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-semibold mb-4">Redes Sociais</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                🐦
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Discord</span>
                💬
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">GitHub</span>
                💻
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} AnimeVerse. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

