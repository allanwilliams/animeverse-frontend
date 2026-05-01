'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface RatingComponentProps {
  initialRating?: number | null;
  maxRating?: number;
  readonly?: boolean;
  onRatingChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function RatingComponent({
  initialRating = null,
  maxRating = 10,
  readonly = false,
  onRatingChange,
  size = 'md',
  showLabel = true,
}: RatingComponentProps) {
  const { isAuthenticated } = useAuth();
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [currentRating, setCurrentRating] = useState<number | null>(initialRating);

  useEffect(() => {
    setCurrentRating(initialRating ?? null);
  }, [initialRating]);

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-base',
    lg: 'text-xl',
  };

  const starsGapClasses = {
    sm: 'gap-0.5',
    md: 'gap-1',
    lg: 'gap-1',
  };

  const handleClick = (rating: number) => {
    if (readonly || !isAuthenticated) return;
    setCurrentRating(rating);
    onRatingChange?.(rating);
  };

  const handleMouseEnter = (rating: number) => {
    if (readonly || !isAuthenticated) return;
    setHoveredRating(rating);
  };

  const handleMouseLeave = () => {
    if (readonly || !isAuthenticated) return;
    setHoveredRating(null);
  };

  const displayRating = hoveredRating ?? currentRating ?? 0;

  if (!isAuthenticated && !readonly) {
    return (
      <div className="text-gray-400 text-sm">
        Faça login para avaliar
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className={`flex items-center ${starsGapClasses[size]}`}>
        {Array.from({ length: maxRating }, (_, i) => i + 1).map((rating) => (
          <button
            key={rating}
            type="button"
            disabled={readonly || !isAuthenticated}
            onClick={() => handleClick(rating)}
            onMouseEnter={() => handleMouseEnter(rating)}
            onMouseLeave={handleMouseLeave}
            className={`
              ${sizeClasses[size]}
              ${readonly || !isAuthenticated ? 'cursor-default' : 'cursor-pointer'}
              transition-colors duration-150 leading-none shrink-0
            `}
            aria-label={`Avaliar ${rating} de ${maxRating}`}
          >
            <span
              className="transition-all duration-150"
              style={rating <= displayRating ? undefined : { filter: 'invert(0.7)' }}
            >
              ⭐
            </span>
          </button>
        ))}
      </div>
      {showLabel && currentRating !== null && (
        <span className="text-gray-300 text-sm font-medium">
        </span>
      )}
    </div>
  );
}

