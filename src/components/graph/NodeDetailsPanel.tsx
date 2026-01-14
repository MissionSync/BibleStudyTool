// components/graph/NodeDetailsPanel.tsx
'use client';

import React from 'react';
import { Node } from 'reactflow';

interface NodeDetailsPanelProps {
  node: Node;
  onClose: () => void;
  studyPlanId?: string;
}

const NODE_TYPE_LABELS: Record<string, string> = {
  note: 'Note',
  passage: 'Passage',
  theme: 'Theme',
  person: 'Person',
  book: 'Book',
  place: 'Place',
};

const NODE_COLORS: Record<string, string> = {
  note: '--node-note',
  passage: '--node-passage',
  theme: '--node-theme',
  person: '--node-person',
  book: '--node-book',
  place: '--node-place',
};

export function NodeDetailsPanel({ node, onClose }: NodeDetailsPanelProps) {
  const colorVar = NODE_COLORS[node.type as keyof typeof NODE_COLORS] || '--border-medium';
  const typeLabel = NODE_TYPE_LABELS[node.type as keyof typeof NODE_TYPE_LABELS] || 'Node';

  const renderNodeSpecificDetails = () => {
    switch (node.type) {
      case 'note':
        return (
          <>
            {node.data.preview && (
              <div className="mb-4">
                <div
                  className="text-xs uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Preview
                </div>
                <div
                  className="text-sm line-clamp-3"
                  style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
                >
                  {node.data.preview}
                </div>
              </div>
            )}
            {node.data.tags && node.data.tags.length > 0 && (
              <div className="mb-4">
                <div
                  className="text-xs uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Tags
                </div>
                <div className="flex flex-wrap gap-1">
                  {node.data.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1"
                      style={{
                        backgroundColor: 'var(--highlight-gold)',
                        color: 'var(--text-secondary)',
                        borderRadius: '2px',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        );

      case 'passage':
        return (
          <>
            {node.data.reference && (
              <div className="mb-4">
                <div
                  className="text-xs uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Reference
                </div>
                <div className="scripture-reference">{node.data.reference}</div>
              </div>
            )}
            {node.data.summary && (
              <div className="mb-4">
                <div
                  className="text-xs uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Summary
                </div>
                <div
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
                >
                  {node.data.summary}
                </div>
              </div>
            )}
          </>
        );

      case 'theme':
      case 'person':
      case 'book':
        return (
          <>
            {node.data.description && (
              <div className="mb-4">
                <div
                  className="text-xs uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Description
                </div>
                <div
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
                >
                  {node.data.description}
                </div>
              </div>
            )}
            {node.data.role && (
              <div className="mb-4">
                <div
                  className="text-xs uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Role
                </div>
                <div
                  className="text-sm capitalize"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {node.data.role}
                </div>
              </div>
            )}
            {node.data.author && (
              <div className="mb-4">
                <div
                  className="text-xs uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Author
                </div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {node.data.author}
                </div>
              </div>
            )}
          </>
        );

      default:
        return node.data.description && (
          <div className="mb-4">
            <div
              className="text-xs uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Description
            </div>
            <div
              className="text-sm"
              style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
            >
              {node.data.description}
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className="fixed right-0 top-0 h-full w-80 flex flex-col z-50"
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderLeft: '1px solid var(--border-light)',
      }}
    >
      {/* Header */}
      <div
        className="p-5"
        style={{ borderBottom: '1px solid var(--border-light)' }}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div
              className="text-xs uppercase tracking-wider mb-2"
              style={{ color: `var(${colorVar})` }}
            >
              {typeLabel}
            </div>
            <h2
              className="text-lg break-words"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontWeight: 500 }}
            >
              {node.data.label}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 transition-colors"
            style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none' }}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {renderNodeSpecificDetails()}

        {/* Node ID */}
        <div
          className="pt-4 mt-4"
          style={{ borderTop: '1px solid var(--border-light)' }}
        >
          <div
            className="text-xs uppercase tracking-wider mb-1"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Node ID
          </div>
          <div
            className="text-xs break-all"
            style={{ color: 'var(--text-tertiary)', fontFamily: 'monospace' }}
          >
            {node.id}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div
        className="p-5 space-y-2"
        style={{ borderTop: '1px solid var(--border-light)' }}
      >
        {node.type === 'note' && (
          <button className="btn-primary w-full text-sm">
            Edit Note
          </button>
        )}
        {node.type === 'passage' && (
          <button className="btn-primary w-full text-sm">
            Read Passage
          </button>
        )}
        <button className="btn-secondary w-full text-sm">
          View Connections
        </button>
      </div>
    </div>
  );
}
