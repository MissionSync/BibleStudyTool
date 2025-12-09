// components/graph/nodes/PassageNode.tsx
'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { BookOpen } from 'lucide-react';

export const PassageNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`
        px-4 py-3 rounded-lg shadow-md bg-emerald-50 border-2
        ${selected ? 'border-emerald-500' : 'border-emerald-300'}
        hover:shadow-lg transition-all duration-200
        min-w-[160px]
      `}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-start gap-2">
        <BookOpen className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-gray-900">
            {data.label}
          </div>
          {data.summary && (
            <div className="text-xs text-gray-600 mt-1 line-clamp-2">
              {data.summary}
            </div>
          )}
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

PassageNode.displayName = 'PassageNode';
