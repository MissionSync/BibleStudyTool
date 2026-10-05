// components/graph/GraphControls.tsx
'use client';

import React from 'react';
import { Download } from 'lucide-react';
import { getEdgeStyle } from '@/lib/graphEdgeStyle';
import type { StudyMapLayout } from '@/lib/graphTransform';

interface GraphControlsProps {
  filteredNodeTypes: Set<string>;
  onFilterChange: (nodeType: string, enabled: boolean) => void;
  layoutAlgorithm: StudyMapLayout;
  onLayoutChange: (layout: StudyMapLayout) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  mapScope: 'week' | 'all';
  onMapScopeChange: (scope: 'week' | 'all') => void;
  onExportJSON?: () => void;
  onExportCSV?: () => void;
  onExportPNG?: () => void;
  onResetLayout?: () => void;
}

const ITEM_TYPE_CONFIG = [
  { type: 'book', label: 'Books', colorVar: '--node-book' },
  { type: 'passage', label: 'Verses', colorVar: '--node-passage' },
  { type: 'note', label: 'Notes', colorVar: '--node-note' },
  { type: 'theme', label: 'Themes', colorVar: '--node-theme' },
  { type: 'person', label: 'People', colorVar: '--node-person' },
  { type: 'place', label: 'Places', colorVar: '--node-place' },
];

const CONNECTION_LEGEND = [
  {
    styleKey: 'contains',
    name: 'links to',
    lines: ['A note points to a verse', 'A verse sits in a book'],
  },
  {
    styleKey: 'theme_connection',
    name: '',
    lines: ['A note connects to a theme'],
  },
  {
    styleKey: 'authored',
    name: '',
    lines: ['A mention is a person or place'],
  },
];

function StrokeSample({ edgeType }: { edgeType: string }) {
  const style = getEdgeStyle(edgeType);
  return (
    <svg width="36" height="10" aria-hidden="true" style={{ flexShrink: 0 }}>
      <line
        x1="0"
        y1="5"
        x2="36"
        y2="5"
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
        strokeDasharray={style.strokeDasharray}
      />
    </svg>
  );
}

export function GraphControls({
  filteredNodeTypes,
  onFilterChange,
  layoutAlgorithm,
  onLayoutChange,
  searchQuery,
  onSearchChange,
  mapScope,
  onMapScopeChange,
  onExportJSON,
  onExportCSV,
  onExportPNG,
  onResetLayout,
}: GraphControlsProps) {
  return (
    <div className="space-y-5 w-64">
      <div>
        <label
          className="block text-xs uppercase tracking-wider mb-2"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Show
        </label>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => onMapScopeChange('week')}
            className="text-left text-sm px-2 py-1.5"
            style={{
              color: mapScope === 'week' ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: mapScope === 'week' ? 'var(--bg-secondary)' : 'none',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            This week&apos;s reading
          </button>
          <button
            type="button"
            onClick={() => onMapScopeChange('all')}
            className="text-left text-sm px-2 py-1.5"
            style={{
              color: mapScope === 'all' ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: mapScope === 'all' ? 'var(--bg-secondary)' : 'none',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            Everything I&apos;ve studied
          </button>
        </div>
      </div>

      <div>
        <label
          className="block text-xs uppercase tracking-wider mb-2"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Search
        </label>
        <input
          type="text"
          placeholder="Search your notes and verses"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full text-sm"
          style={{ height: '2.5rem' }}
        />
      </div>

      <div>
        <label
          className="block text-xs uppercase tracking-wider mb-3"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Filters
        </label>
        <div className="space-y-2">
          {ITEM_TYPE_CONFIG.map(({ type, label, colorVar }) => (
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

      <div>
        <label
          className="block text-xs uppercase tracking-wider mb-3"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Connections
        </label>
        <div className="space-y-3">
          {CONNECTION_LEGEND.map((entry) => (
            <div key={entry.styleKey} className="flex gap-2">
              <StrokeSample edgeType={entry.styleKey} />
              <div>
                {entry.name ? (
                  <div className="text-xs mb-1" style={{ color: 'var(--text-primary)' }}>
                    {entry.name}
                  </div>
                ) : null}
                {entry.lines.map((line) => (
                  <div key={line} className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label
          className="block text-xs uppercase tracking-wider mb-2"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Layout
        </label>
        <select
          value={layoutAlgorithm}
          onChange={(e) => onLayoutChange(e.target.value as StudyMapLayout)}
          className="w-full text-sm"
          style={{ height: '2.5rem' }}
          aria-label="Layout"
        >
          <option value="type">By type</option>
          <option value="connections">By connections</option>
          <option value="circle">In a circle</option>
        </select>
      </div>

      {onExportPNG && (
        <div>
          <button
            type="button"
            onClick={onExportPNG}
            className="w-full py-2 text-sm transition-colors flex items-center justify-center gap-1"
            style={{
              color: 'var(--text-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-secondary)',
            }}
          >
            <Download size={14} />
            Save as picture
          </button>
        </div>
      )}

      {(onExportJSON || onExportCSV) && (
        <div>
          <label
            className="block text-xs uppercase tracking-wider mb-2"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Download a copy for your records
          </label>
          <div className="flex gap-2">
            {onExportJSON && (
              <button
                type="button"
                onClick={onExportJSON}
                className="flex-1 py-1.5 text-xs transition-colors flex items-center justify-center gap-1"
                style={{
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'none',
                }}
              >
                <Download size={12} />
                JSON
              </button>
            )}
            {onExportCSV && (
              <button
                type="button"
                onClick={onExportCSV}
                className="flex-1 py-1.5 text-xs transition-colors flex items-center justify-center gap-1"
                style={{
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'none',
                }}
              >
                <Download size={12} />
                CSV
              </button>
            )}
          </div>
        </div>
      )}

      <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
        <button
          type="button"
          onClick={() => {
            ITEM_TYPE_CONFIG.forEach(({ type }) => onFilterChange(type, true));
            onSearchChange('');
          }}
          className="w-full py-2 text-sm transition-colors"
          style={{
            color: 'var(--text-secondary)',
            background: 'none',
            border: 'none',
          }}
        >
          Reset filters
        </button>
        {onResetLayout && (
          <button
            type="button"
            onClick={onResetLayout}
            className="w-full py-2 text-sm transition-colors"
            style={{
              color: 'var(--text-secondary)',
              background: 'none',
              border: 'none',
            }}
          >
            Reset layout
          </button>
        )}
      </div>
    </div>
  );
}
