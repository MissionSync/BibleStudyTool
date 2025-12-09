// components/graph/GraphControls.tsx
'use client';

import React from 'react';
import { Search, Filter } from 'lucide-react';

interface GraphControlsProps {
  filteredNodeTypes: Set<string>;
  onFilterChange: (nodeType: string, enabled: boolean) => void;
  layoutAlgorithm: 'force' | 'hierarchical' | 'radial';
  onLayoutChange: (layout: 'force' | 'hierarchical' | 'radial') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const NODE_TYPE_CONFIG = [
  { type: 'book', label: 'Books', color: 'bg-blue-500' },
  { type: 'passage', label: 'Passages', color: 'bg-emerald-500' },
  { type: 'note', label: 'Notes', color: 'bg-amber-500' },
  { type: 'theme', label: 'Themes', color: 'bg-purple-500' },
  { type: 'person', label: 'People', color: 'bg-rose-500' },
  { type: 'place', label: 'Places', color: 'bg-cyan-500' },
];

export function GraphControls({
  filteredNodeTypes,
  onFilterChange,
  layoutAlgorithm,
  onLayoutChange,
  searchQuery,
  onSearchChange,
}: GraphControlsProps) {
  return (
    <div className="space-y-4 w-64">
      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Nodes
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Node Type Filters */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-4 h-4 text-gray-700" />
          <label className="block text-sm font-medium text-gray-700">
            Node Types
          </label>
        </div>
        <div className="space-y-2">
          {NODE_TYPE_CONFIG.map(({ type, label, color }) => (
            <label
              key={type}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
            >
              <input
                type="checkbox"
                checked={filteredNodeTypes.has(type)}
                onChange={(e) => onFilterChange(type, e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div className={`w-3 h-3 rounded ${color}`} />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Layout Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Layout
        </label>
        <select
          value={layoutAlgorithm}
          onChange={(e) => onLayoutChange(e.target.value as any)}
          className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="force">Force Directed</option>
          <option value="hierarchical">Hierarchical</option>
          <option value="radial">Radial</option>
        </select>
      </div>

      {/* Quick Actions */}
      <div className="pt-2 border-t">
        <button
          onClick={() => {
            // Reset all filters
            NODE_TYPE_CONFIG.forEach(({ type }) => onFilterChange(type, true));
            onSearchChange('');
          }}
          className="w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
