// components/graph/nodes/PassageNode.tsx
'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export const PassageNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      style={{
        padding: '10px 14px',
        borderRadius: '2px',
        backgroundColor: 'var(--bg-primary)',
        border: selected ? '2px solid var(--node-passage)' : '1px solid var(--border-light)',
        minWidth: '120px',
        maxWidth: '180px',
        transition: 'border-color 150ms ease',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ width: 8, height: 8 }} />

      <div
        className="text-xs uppercase tracking-wider mb-1"
        style={{ color: 'var(--node-passage)' }}
      >
        Passage
      </div>
      <div
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '0.875rem',
          color: 'var(--text-primary)',
        }}
      >
        {data.label}
      </div>
      {data.summary && (
        <div
          className="text-xs mt-1 line-clamp-2"
          style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}
        >
          {data.summary}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ width: 8, height: 8 }} />
    </div>
  );
});

PassageNode.displayName = 'PassageNode';
