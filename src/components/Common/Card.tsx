'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export function Card({ children, className = '', padding = 'md', hover = false }: CardProps) {
  const paddings = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={`bg-gray-800 rounded-lg border border-gray-700 ${paddings[padding]} ${
        hover ? 'hover:bg-gray-750 transition-colors' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

