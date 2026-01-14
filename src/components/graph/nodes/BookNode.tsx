// components/graph/nodes/BookNode.tsx
'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export const BookNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: '2px',
        backgroundColor: 'var(--bg-primary)',
        border: selected ? '2px solid var(--node-book)' : '1px solid var(--border-light)',
        minWidth: '140px',
        transition: 'border-color 150ms ease',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ width: 8, height: 8 }} />

      <div
        className="text-xs uppercase tracking-wider mb-1"
        style={{ color: 'var(--node-book)' }}
      >
        Book
      </div>
      <div
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '0.9375rem',
          color: 'var(--text-primary)',
          fontWeight: 500,
        }}
      >
        {data.label}
      </div>
      {data.author && (
        <div
          className="text-xs mt-1"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {data.author}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ width: 8, height: 8 }} />
    </div>
  );
});

BookNode.displayName = 'BookNode';
