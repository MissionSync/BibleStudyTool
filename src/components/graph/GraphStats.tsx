// components/graph/GraphStats.tsx
'use client';

import React from 'react';

interface GraphStatsProps {
  stats: {
    totalNodes: number;
    totalEdges: number;
    nodeTypeCounts: Record<string, number>;
    edgeTypeCounts: Record<string, number>;
    visibleNodes: number;
    visibleEdges: number;
  };
}

const NODE_TYPE_LABELS: Record<string, string> = {
  book: 'Books',
  passage: 'Passages',
  note: 'Notes',
  theme: 'Themes',
  person: 'People',
  place: 'Places',
};

export function GraphStats({ stats }: GraphStatsProps) {
  return (
    <div className="space-y-5 w-48">
      {/* Overview */}
      <div>
        <h3
          className="text-xs uppercase tracking-wider mb-3"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Overview
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div
            className="p-3"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '2px',
            }}
          >
            <div
              className="text-xl font-medium"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}
            >
              {stats.totalNodes}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Nodes
            </div>
          </div>
          <div
            className="p-3"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '2px',
            }}
          >
            <div
              className="text-xl font-medium"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}
            >
              {stats.totalEdges}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Edges
            </div>
          </div>
        </div>
      </div>

      {/* Visible */}
      <div>
        <h3
          className="text-xs uppercase tracking-wider mb-3"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Visible
        </h3>

        <div
          className="p-3 space-y-2"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '2px',
          }}
        >
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Nodes</span>
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
              {stats.visibleNodes} / {stats.totalNodes}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Connections</span>
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
              {stats.visibleEdges} / {stats.totalEdges}
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div>
        <h3
          className="text-xs uppercase tracking-wider mb-3"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Breakdown
        </h3>

        <div className="space-y-2">
          {Object.entries(stats.nodeTypeCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {NODE_TYPE_LABELS[type] || type}
                </span>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  {count}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
