// components/graph/nodes/BookNode.tsx
'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Book } from 'lucide-react';

export const BookNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`
        px-5 py-4 rounded-xl shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 border-2
        ${selected ? 'border-blue-500 ring-2 ring-blue-300' : 'border-blue-400'}
        hover:shadow-xl transition-all duration-200
        min-w-[180px]
      `}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-start gap-3">
        <Book className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-base text-gray-900">
            {data.label}
          </div>
          {data.description && (
            <div className="text-xs text-gray-600 mt-1">
              {data.description}
            </div>
          )}
          {data.author && (
            <div className="text-xs text-blue-700 mt-1 font-medium">
              by {data.author}
            </div>
          )}
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

BookNode.displayName = 'BookNode';
