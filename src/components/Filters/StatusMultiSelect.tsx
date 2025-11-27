'use client';

import { STATUS_LABELS } from '@/utils/constants';

interface StatusMultiSelectProps {
  selectedStatuses: string[];
  onStatusChange: (statuses: string[]) => void;
}

export function StatusMultiSelect({ selectedStatuses, onStatusChange }: StatusMultiSelectProps) {
  const statusOptions = Object.entries(STATUS_LABELS);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(e.target.selectedOptions, option => option.value);
    onStatusChange(values);
  };

  return (
    <div className="w-full">
      <label htmlFor="status-select" className="block text-sm font-medium text-gray-300 mb-2">
        Status
      </label>
      <select
        id="status-select"
        multiple
        value={selectedStatuses}
        onChange={handleChange}
        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        size={4}
      >
        {statusOptions.map(([value, label]) => (
          <option key={value} value={value} className="bg-gray-800 text-white">
            {label}
          </option>
        ))}
      </select>
      {selectedStatuses.length > 0 && (
        <div className="mt-1 text-xs text-gray-400">
          {selectedStatuses.length} selecionado(s)
        </div>
      )}
    </div>
  );
}

