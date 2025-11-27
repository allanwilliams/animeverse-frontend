'use client';

import { useState, useRef, useEffect } from 'react';
import { STATUS_LABELS } from '@/utils/constants';

interface StatusAutocompleteProps {
  selectedStatuses: string[];
  onStatusChange: (statuses: string[]) => void;
  statusOptions?: Array<{ value: string; label: string }>;
}

export function StatusAutocomplete({ selectedStatuses = [], onStatusChange, statusOptions: customStatusOptions }: StatusAutocompleteProps) {
  const statusOptions = customStatusOptions 
    ? customStatusOptions.map(opt => [opt.value, opt.label] as [string, string])
    : Object.entries(STATUS_LABELS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get selected status labels
  const selectedStatusLabels = statusOptions
    .filter(([value]) => selectedStatuses && selectedStatuses.includes(value))
    .map(([, label]) => label);

  // Filter statuses based on search term
  const filteredStatuses = statusOptions.filter(
    ([value, label]) =>
      label.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !(selectedStatuses && selectedStatuses.includes(value))
  );

  const handleSelect = (statusValue: string) => {
    if (!selectedStatuses || !selectedStatuses.includes(statusValue)) {
      onStatusChange([...(selectedStatuses || []), statusValue]);
    }
    setSearchTerm('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleRemove = (statusValue: string) => {
    onStatusChange((selectedStatuses || []).filter(s => s !== statusValue));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full">
      <label htmlFor="status-autocomplete" className="block text-sm font-medium text-gray-300 mb-2">
        Status
      </label>
      <div className="relative" ref={dropdownRef}>
        {/* Input */}
        <div className="relative">
          <input
            ref={inputRef}
            id="status-autocomplete"
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder="Buscar status..."
            className="w-full px-4 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Selected tags - fixed position below input */}
        {selectedStatusLabels.length > 0 && (
          <div className="mt-2 max-h-20 overflow-y-auto">
            <div className="flex flex-wrap gap-2">
              {selectedStatusLabels.map((label) => {
                const statusValue = statusOptions.find(([, l]) => l === label)?.[0];
                if (!statusValue) return null;
                return (
                  <span
                    key={statusValue}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-purple-600 text-white text-xs rounded-md"
                  >
                    {label}
                    <button
                      type="button"
                      onClick={() => handleRemove(statusValue)}
                      className="hover:text-gray-200 focus:outline-none"
                      aria-label={`Remover ${label}`}
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Dropdown */}
        {isOpen && filteredStatuses.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
            {filteredStatuses.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => handleSelect(value)}
                className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 focus:outline-none focus:bg-gray-700 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {isOpen && searchTerm && filteredStatuses.length === 0 && (
          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
            <div className="px-4 py-2 text-gray-400 text-sm">
              Nenhum status encontrado
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

