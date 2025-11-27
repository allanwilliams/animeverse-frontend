'use client';

import { MANGA_STATUS_LABELS } from '@/utils/constants';

interface MangaStatusFilterProps {
  selectedStatus?: string;
  onStatusChange: (status: string) => void;
}

export function MangaStatusFilter({ selectedStatus, onStatusChange }: MangaStatusFilterProps) {
  const statusOptions = Object.entries(MANGA_STATUS_LABELS);

  return (
    <div>
      <h3 className="text-white font-semibold mb-3">Status</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onStatusChange('')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            !selectedStatus
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Todos
        </button>
        {statusOptions.map(([value, label]) => (
          <button
            key={value}
            onClick={() => onStatusChange(value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === value
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

