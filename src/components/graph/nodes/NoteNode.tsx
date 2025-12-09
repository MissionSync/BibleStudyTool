// components/graph/nodes/NoteNode.tsx
'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FileText, Tag } from 'lucide-react';

export const NoteNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`
        px-4 py-3 rounded-lg shadow-md bg-amber-50 border-2
        ${selected ? 'border-amber-500' : 'border-amber-300'}
        hover:shadow-lg transition-all duration-200
        min-w-[200px] max-w-[300px]
      `}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-start gap-2 mb-2">
        <FileText className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-gray-900 truncate">
            {data.label}
          </div>
          {data.preview && (
            <div className="text-xs text-gray-600 mt-1 line-clamp-2">
              {data.preview}
            </div>
          )}
        </div>
      </div>
      
      {data.tags && data.tags.length > 0 && (
        <div className="flex items-center gap-1 mt-2 flex-wrap">
          <Tag className="w-3 h-3 text-amber-600" />
          {data.tags.slice(0, 2).map((tag: string) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded"
            >
              {tag}
            </span>
          ))}
          {data.tags.length > 2 && (
            <span className="text-xs text-amber-600">
              +{data.tags.length - 2}
            </span>
          )}
        </div>
      )}
      
      {data.referenceCount && (
        <div className="text-xs text-gray-500 mt-2">
          {data.referenceCount} reference{data.referenceCount !== 1 ? 's' : ''}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

NoteNode.displayName = 'NoteNode';
