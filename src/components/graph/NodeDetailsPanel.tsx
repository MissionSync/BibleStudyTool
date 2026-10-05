// components/graph/NodeDetailsPanel.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Node } from 'reactflow';

interface NodeDetailsPanelProps {
  node: Node;
  onClose: () => void;
  studyPlanId?: string;
}

const ITEM_TYPE_LABELS: Record<string, string> = {
  note: 'Note',
  passage: 'Verse',
  theme: 'Theme',
  person: 'Person',
  book: 'Book',
  place: 'Place',
};

const ITEM_COLORS: Record<string, string> = {
  note: '--node-note',
  passage: '--node-passage',
  theme: '--node-theme',
  person: '--node-person',
  book: '--node-book',
  place: '--node-place',
};

function leadSentence(node: Node): string {
  const label = node.data.label || 'this';
  switch (node.type) {
    case 'note':
      return `This is your note about ${label}.`;
    case 'passage':
      return `This verse is ${label}.`;
    case 'book':
      return `This book is ${label}.`;
    case 'theme':
      return `This theme is ${label}.`;
    case 'person':
      return `This person is ${label}.`;
    case 'place':
      return `This place is ${label}.`;
    default:
      return `This is ${label}.`;
  }
}

function noteIdFromNode(node: Node): string | null {
  const referenceId = node.data.referenceId;
  if (typeof referenceId === 'string' && referenceId.length > 0) return referenceId;
  return null;
}

export function NodeDetailsPanel({ node, onClose }: NodeDetailsPanelProps) {
  const colorVar = ITEM_COLORS[node.type as keyof typeof ITEM_COLORS] || '--border-medium';
  const typeLabel = ITEM_TYPE_LABELS[node.type as keyof typeof ITEM_TYPE_LABELS] || 'Item';
  const noteId = node.type === 'note' ? noteIdFromNode(node) : null;

  const renderItemDetails = () => {
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
                        borderRadius: 'var(--radius-pill)',
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

      <div className="flex-1 overflow-y-auto p-5">
        <p className="text-sm mb-4" style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>
          {leadSentence(node)}
        </p>
        {renderItemDetails()}
      </div>

      <div
        className="p-5 space-y-2"
        style={{ borderTop: '1px solid var(--border-light)' }}
      >
        {noteId && (
          <Link href={`/notes?note=${encodeURIComponent(noteId)}`} className="btn-primary w-full text-sm" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
            Open this note
          </Link>
        )}
        {node.type === 'passage' && (
          <button className="btn-primary w-full text-sm">
            Read passage
          </button>
        )}
        <button className="btn-secondary w-full text-sm">
          View connections
        </button>
      </div>
    </div>
  );
}
