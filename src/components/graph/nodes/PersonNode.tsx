// components/graph/nodes/PersonNode.tsx
'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { User } from 'lucide-react';

export const PersonNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`
        px-4 py-3 rounded-lg shadow-md bg-rose-50 border-2
        ${selected ? 'border-rose-500' : 'border-rose-300'}
        hover:shadow-lg transition-all duration-200
        min-w-[140px]
      `}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-start gap-2">
        <User className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-gray-900">
            {data.label}
          </div>
          {data.role && (
            <div className="text-xs text-gray-600 mt-1 capitalize">
              {data.role}
            </div>
          )}
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

PersonNode.displayName = 'PersonNode';
