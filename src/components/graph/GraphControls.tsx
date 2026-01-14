// components/graph/GraphControls.tsx
'use client';

import React from 'react';

interface GraphControlsProps {
  filteredNodeTypes: Set<string>;
  onFilterChange: (nodeType: string, enabled: boolean) => void;
  layoutAlgorithm: 'force' | 'hierarchical' | 'radial';
  onLayoutChange: (layout: 'force' | 'hierarchical' | 'radial') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const NODE_TYPE_CONFIG = [
  { type: 'book', label: 'Books', colorVar: '--node-book' },
  { type: 'passage', label: 'Passages', colorVar: '--node-passage' },
  { type: 'note', label: 'Notes', colorVar: '--node-note' },
  { type: 'theme', label: 'Themes', colorVar: '--node-theme' },
  { type: 'person', label: 'People', colorVar: '--node-person' },
  { type: 'place', label: 'Places', colorVar: '--node-place' },
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
    <div className="space-y-5 w-56">
      {/* Search */}
      <div>
        <label
          className="block text-xs uppercase tracking-wider mb-2"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Search
        </label>
        <input
          type="text"
          placeholder="Search nodes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full text-sm"
          style={{ height: '2.5rem' }}
        />
      </div>

      {/* Node Type Filters */}
      <div>
        <label
          className="block text-xs uppercase tracking-wider mb-3"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Node Types
        </label>
        <div className="space-y-2">
          {NODE_TYPE_CONFIG.map(({ type, label, colorVar }) => (
            <label
              key={type}
              className="flex items-center gap-2 cursor-pointer py-1"
            >
              <input
                type="checkbox"
                checked={filteredNodeTypes.has(type)}
                onChange={(e) => onFilterChange(type, e.target.checked)}
                style={{
                  width: '14px',
                  height: '14px',
                  accentColor: 'var(--accent)',
                }}
              />
              <div
                className="w-2 h-2 rounded-sm"
                style={{ backgroundColor: `var(${colorVar})` }}
              />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Layout Selection */}
      <div>
        <label
          className="block text-xs uppercase tracking-wider mb-2"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Layout
        </label>
        <select
          value={layoutAlgorithm}
          onChange={(e) => onLayoutChange(e.target.value as 'force' | 'hierarchical' | 'radial')}
          className="w-full text-sm"
          style={{ height: '2.5rem' }}
        >
          <option value="force">Force Directed</option>
          <option value="hierarchical">Hierarchical</option>
          <option value="radial">Radial</option>
        </select>
      </div>

      {/* Reset */}
      <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
        <button
          onClick={() => {
            NODE_TYPE_CONFIG.forEach(({ type }) => onFilterChange(type, true));
            onSearchChange('');
          }}
          className="w-full py-2 text-sm transition-colors"
          style={{
            color: 'var(--text-secondary)',
            background: 'none',
            border: 'none',
          }}
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
