// components/graph/nodes/PlaceNode.tsx
'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export const PlaceNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      style={{
        padding: '10px 14px',
        borderRadius: '2px',
        backgroundColor: 'var(--bg-primary)',
        border: selected ? '2px solid var(--node-place)' : '1px solid var(--border-light)',
        minWidth: '100px',
        transition: 'border-color 150ms ease',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ width: 8, height: 8 }} />

      <div
        className="text-xs uppercase tracking-wider mb-1"
        style={{ color: 'var(--node-place)' }}
      >
        Place
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
      {data.region && (
        <div
          className="text-xs mt-1 capitalize"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {data.region}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ width: 8, height: 8 }} />
    </div>
  );
});

PlaceNode.displayName = 'PlaceNode';
