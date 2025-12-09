// components/graph/GraphStats.tsx
'use client';

import React from 'react';
import { BarChart3, Network, Eye } from 'lucide-react';

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
  const mostCommonNodeType = Object.entries(stats.nodeTypeCounts)
    .sort(([, a], [, b]) => b - a)[0];

  const mostCommonEdgeType = Object.entries(stats.edgeTypeCounts)
    .sort(([, a], [, b]) => b - a)[0];

  return (
    <div className="space-y-4 w-64">
      {/* Overview */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-gray-700" />
          <h3 className="text-sm font-semibold text-gray-900">Graph Overview</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-900">{stats.totalNodes}</div>
            <div className="text-xs text-blue-600">Total Nodes</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-900">{stats.totalEdges}</div>
            <div className="text-xs text-purple-600">Total Edges</div>
          </div>
        </div>
      </div>

      {/* Currently Visible */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Eye className="w-4 h-4 text-gray-700" />
          <h3 className="text-sm font-semibold text-gray-900">Currently Visible</h3>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Nodes</span>
            <span className="text-sm font-semibold text-gray-900">
              {stats.visibleNodes} / {stats.totalNodes}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Connections</span>
            <span className="text-sm font-semibold text-gray-900">
              {stats.visibleEdges} / {stats.totalEdges}
            </span>
          </div>
        </div>
      </div>

      {/* Node Breakdown */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Network className="w-4 h-4 text-gray-700" />
          <h3 className="text-sm font-semibold text-gray-900">Node Breakdown</h3>
        </div>
        
        <div className="space-y-2">
          {Object.entries(stats.nodeTypeCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">
                  {NODE_TYPE_LABELS[type] || type}
                </span>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Insights */}
      {mostCommonNodeType && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3">
          <div className="text-xs font-medium text-gray-600 mb-1">💡 Insight</div>
          <div className="text-sm text-gray-900">
            Most common: <span className="font-semibold capitalize">
              {NODE_TYPE_LABELS[mostCommonNodeType[0]] || mostCommonNodeType[0]}
            </span>
            {' '}({mostCommonNodeType[1]})
          </div>
        </div>
      )}
    </div>
  );
}
