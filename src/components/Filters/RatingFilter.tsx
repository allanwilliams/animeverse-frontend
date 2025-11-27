'use client';

import { useState } from 'react';

interface RatingFilterProps {
  onRatingChange: (min: number, max: number) => void;
}

export function RatingFilter({ onRatingChange }: RatingFilterProps) {
  const [minRating, setMinRating] = useState(0);
  const [maxRating, setMaxRating] = useState(10);

  const handleApply = () => {
    onRatingChange(minRating, maxRating);
  };

  return (
    <div>
      <h3 className="text-white font-semibold mb-3">Rating</h3>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="text-gray-400 text-sm block mb-1">Mínimo</label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={minRating}
            onChange={(e) => setMinRating(parseFloat(e.target.value))}
            className="w-full"
          />
          <span className="text-white text-sm">{minRating.toFixed(1)}</span>
        </div>
        <div className="flex-1">
          <label className="text-gray-400 text-sm block mb-1">Máximo</label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={maxRating}
            onChange={(e) => setMaxRating(parseFloat(e.target.value))}
            className="w-full"
          />
          <span className="text-white text-sm">{maxRating.toFixed(1)}</span>
        </div>
      </div>
      <button
        onClick={handleApply}
        className="mt-3 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        Aplicar
      </button>
    </div>
  );
}

