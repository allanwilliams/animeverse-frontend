import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Layout/Navbar';
import { Footer } from '@/components/Layout/Footer';
import { AuthProvider } from '@/contexts/AuthContext';
import { getUserServer } from '@/lib/api-server';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AnimeVerse - Seu Portal de Animes',
  description: 'Descubra, acompanhe e avalie seus animes favoritos',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Buscar usuário no servidor para SSR
  const initialUser = await getUserServer();

  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-gray-900 min-h-screen`}>
        <AuthProvider initialUser={initialUser}>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
