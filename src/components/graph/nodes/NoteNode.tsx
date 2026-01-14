// components/graph/nodes/NoteNode.tsx
'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export const NoteNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      style={{
        padding: '10px 14px',
        borderRadius: '2px',
        backgroundColor: 'var(--bg-primary)',
        border: selected ? '2px solid var(--node-note)' : '1px solid var(--border-light)',
        minWidth: '140px',
        maxWidth: '200px',
        transition: 'border-color 150ms ease',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ width: 8, height: 8 }} />

      <div
        className="text-xs uppercase tracking-wider mb-1"
        style={{ color: 'var(--node-note)' }}
      >
        Note
      </div>
      <div
        className="truncate"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '0.875rem',
          color: 'var(--text-primary)',
        }}
      >
        {data.label}
      </div>
      {data.preview && (
        <div
          className="text-xs mt-1 line-clamp-2"
          style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}
        >
          {data.preview}
        </div>
      )}

      {data.tags && data.tags.length > 0 && (
        <div className="flex items-center gap-1 mt-2 flex-wrap">
          {data.tags.slice(0, 2).map((tag: string) => (
            <span
              key={tag}
              className="text-xs px-1.5 py-0.5"
              style={{
                backgroundColor: 'var(--highlight-gold)',
                color: 'var(--text-secondary)',
                borderRadius: '2px',
              }}
            >
              {tag}
            </span>
          ))}
          {data.tags.length > 2 && (
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              +{data.tags.length - 2}
            </span>
          )}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ width: 8, height: 8 }} />
    </div>
  );
});

NoteNode.displayName = 'NoteNode';
