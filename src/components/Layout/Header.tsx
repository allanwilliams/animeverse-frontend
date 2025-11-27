'use client';

import { ReactNode } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function Header({ title, subtitle, children }: HeaderProps) {
  return (
    <div className="bg-gradient-to-r from-purple-900 to-pink-900 py-12 px-4">
      <div className="container mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{title}</h1>
        {subtitle && <p className="text-xl text-gray-300">{subtitle}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}

