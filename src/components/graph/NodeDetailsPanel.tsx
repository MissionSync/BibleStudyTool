// components/graph/NodeDetailsPanel.tsx
'use client';

import React from 'react';
import { X, Tag, BookOpen, User, Lightbulb, Book, MapPin } from 'lucide-react';
import { Node } from 'reactflow';

interface NodeDetailsPanelProps {
  node: Node;
  onClose: () => void;
  studyPlanId?: string;
}

const NODE_ICONS = {
  note: BookOpen,
  passage: BookOpen,
  theme: Lightbulb,
  person: User,
  book: Book,
  place: MapPin,
};

const NODE_COLORS = {
  note: 'border-amber-300 bg-amber-50',
  passage: 'border-emerald-300 bg-emerald-50',
  theme: 'border-purple-300 bg-purple-50',
  person: 'border-rose-300 bg-rose-50',
  book: 'border-blue-300 bg-blue-50',
  place: 'border-cyan-300 bg-cyan-50',
};

export function NodeDetailsPanel({ node, onClose, studyPlanId }: NodeDetailsPanelProps) {
  const Icon = NODE_ICONS[node.type as keyof typeof NODE_ICONS] || BookOpen;
  const colorClass = NODE_COLORS[node.type as keyof typeof NODE_COLORS] || 'border-gray-300 bg-gray-50';

  const renderNodeSpecificDetails = () => {
    switch (node.type) {
      case 'note':
        return (
          <>
            {node.data.preview && (
              <div className="mb-3">
                <div className="text-xs font-medium text-gray-600 mb-1">Preview</div>
                <div className="text-sm text-gray-700 line-clamp-3">{node.data.preview}</div>
              </div>
            )}
            {node.data.tags && node.data.tags.length > 0 && (
              <div className="mb-3">
                <div className="text-xs font-medium text-gray-600 mb-2">Tags</div>
                <div className="flex flex-wrap gap-1">
                  {node.data.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {node.data.referenceCount > 0 && (
              <div className="text-xs text-gray-600">
                {node.data.referenceCount} Bible reference{node.data.referenceCount !== 1 ? 's' : ''}
              </div>
            )}
          </>
        );

      case 'passage':
        return (
          <>
            {node.data.reference && (
              <div className="mb-3">
                <div className="text-xs font-medium text-gray-600 mb-1">Reference</div>
                <div className="text-sm font-mono text-gray-700">{node.data.reference}</div>
              </div>
            )}
            {node.data.summary && (
              <div className="mb-3">
                <div className="text-xs font-medium text-gray-600 mb-1">Summary</div>
                <div className="text-sm text-gray-700">{node.data.summary}</div>
              </div>
            )}
          </>
        );

      case 'theme':
        return (
          <>
            {node.data.description && (
              <div className="mb-3">
                <div className="text-xs font-medium text-gray-600 mb-1">Description</div>
                <div className="text-sm text-gray-700">{node.data.description}</div>
              </div>
            )}
            {node.data.verseCount > 0 && (
              <div className="text-xs text-gray-600">
                {node.data.verseCount} verse{node.data.verseCount !== 1 ? 's' : ''} tagged
              </div>
            )}
          </>
        );

      case 'person':
        return (
          <>
            {node.data.description && (
              <div className="mb-3">
                <div className="text-xs font-medium text-gray-600 mb-1">Description</div>
                <div className="text-sm text-gray-700">{node.data.description}</div>
              </div>
            )}
            {node.data.role && (
              <div className="mb-3">
                <div className="text-xs font-medium text-gray-600 mb-1">Role</div>
                <div className="text-sm text-gray-700 capitalize">{node.data.role}</div>
              </div>
            )}
          </>
        );

      case 'book':
        return (
          <>
            {node.data.description && (
              <div className="mb-3">
                <div className="text-xs font-medium text-gray-600 mb-1">Description</div>
                <div className="text-sm text-gray-700">{node.data.description}</div>
              </div>
            )}
            {node.data.author && (
              <div className="mb-3">
                <div className="text-xs font-medium text-gray-600 mb-1">Author</div>
                <div className="text-sm text-gray-700">{node.data.author}</div>
              </div>
            )}
            {node.data.date && (
              <div className="mb-3">
                <div className="text-xs font-medium text-gray-600 mb-1">Date</div>
                <div className="text-sm text-gray-700">{node.data.date}</div>
              </div>
            )}
          </>
        );

      default:
        return node.data.description && (
          <div className="mb-3">
            <div className="text-xs font-medium text-gray-600 mb-1">Description</div>
            <div className="text-sm text-gray-700">{node.data.description}</div>
          </div>
        );
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className={`border-b-2 ${colorClass} p-4`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1">
            <Icon className="w-5 h-5 flex-shrink-0" />
            <h2 className="text-lg font-bold text-gray-900 break-words">{node.data.label}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/50 rounded transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="text-xs font-medium text-gray-600 capitalize">
          {node.type} Node
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {renderNodeSpecificDetails()}

          {/* Node ID (for debugging) */}
          <div className="pt-4 border-t">
            <div className="text-xs font-medium text-gray-500 mb-1">Node ID</div>
            <div className="text-xs font-mono text-gray-400 break-all">{node.id}</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t p-4 space-y-2">
        {node.type === 'note' && (
          <button
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            Edit Note
          </button>
        )}
        {node.type === 'passage' && (
          <button
            className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
          >
            Read Passage
          </button>
        )}
        <button
          className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          View Connections
        </button>
      </div>
    </div>
  );
}
