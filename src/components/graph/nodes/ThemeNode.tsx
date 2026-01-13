// components/graph/nodes/ThemeNode.tsx
'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Lightbulb } from 'lucide-react';

export const ThemeNode = memo(({ data, selected }: NodeProps) => {
  const bgColor = data.color ? `${data.color}20` : 'bg-purple-50';
  const borderColor = data.color 
    ? selected ? data.color : `${data.color}80`
    : selected ? 'border-purple-500' : 'border-purple-300';
  
  return (
    <div
      className={`
        px-4 py-3 rounded-lg shadow-md border-2
        ${selected ? 'ring-2 ring-offset-2 ring-purple-400' : ''}
        hover:shadow-lg transition-all duration-200
        min-w-[140px]
      `}
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
      }}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-start gap-2">
        <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: data.color || '#8b5cf6' }} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-gray-900">
            {data.label}
          </div>
          {data.verseCount && (
            <div className="text-xs text-gray-600 mt-1">
              {data.verseCount} verse{data.verseCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

ThemeNode.displayName = 'ThemeNode';
