// components/notes/NoteEditor.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface NoteEditorProps {
  initialTitle?: string;
  initialContent?: string;
  initialTags?: string[];
  initialReferences?: string[];
  onSave: (note: {
    title: string;
    content: string;
    tags: string[];
    references: string[];
  }) => Promise<void>;
  onCancel?: () => void;
}

export function NoteEditor({
  initialTitle = '',
  initialContent = '',
  initialTags = [],
  initialReferences = [],
  onSave,
  onCancel,
}: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState('');
  const [references, setReferences] = useState<string[]>(initialReferences);
  const [referenceInput, setReferenceInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [detectedReferences, setDetectedReferences] = useState<string[]>([]);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px]',
      },
    },
    onUpdate: ({ editor }) => {
      const content = editor.getText();
      const detected = detectBibleReferences(content);
      setDetectedReferences(detected);
    },
  });

  const detectBibleReferences = useCallback((text: string): string[] => {
    const patterns = [
      /(?:1|2|3)?\s*(?:John|Peter|Corinthians|Thessalonians|Timothy|Kings|Chronicles|Samuel)\s+\d+:\d+(?:-\d+)?/gi,
      /(?:Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|Ezra|Nehemiah|Esther|Job|Psalm|Psalms|Proverbs|Ecclesiastes|Song|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|Acts|Romans|Galatians|Ephesians|Philippians|Colossians|Philemon|Hebrews|James|Jude|Revelation)\s+\d+:\d+(?:-\d+)?/gi,
    ];

    const matches: string[] = [];
    patterns.forEach(pattern => {
      const found = text.match(pattern);
      if (found) {
        matches.push(...found.map(ref => ref.trim()));
      }
    });

    return Array.from(new Set(matches));
  }, []);

  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  }, [tagInput, tags]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  }, [tags]);

  const handleAddReference = useCallback((ref: string) => {
    if (ref.trim() && !references.includes(ref.trim())) {
      setReferences([...references, ref.trim()]);
      setReferenceInput('');
    }
  }, [references]);

  const handleRemoveReference = useCallback((refToRemove: string) => {
    setReferences(references.filter(ref => ref !== refToRemove));
  }, [references]);

  const handleSave = useCallback(async () => {
    if (!title.trim() || !editor) return;

    setIsSaving(true);
    try {
      const content = editor.getHTML();

      await onSave({
        title: title.trim(),
        content,
        tags,
        references: [...references, ...detectedReferences.filter(r => !references.includes(r))],
      });
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSaving(false);
    }
  }, [title, editor, tags, references, detectedReferences, onSave]);

  if (!editor) return null;

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-light)',
        borderRadius: '2px',
      }}
    >
      {/* Title */}
      <div className="p-6" style={{ borderBottom: '1px solid var(--border-light)' }}>
        <label
          htmlFor="note-title"
          className="block text-xs uppercase tracking-wider mb-2"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Title
        </label>
        <input
          id="note-title"
          type="text"
          placeholder="Enter your note title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.25rem',
            border: 'none',
            padding: 0,
            background: 'transparent',
          }}
        />
      </div>

      {/* Toolbar */}
      <div
        className="flex items-center gap-1 p-3"
        style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}
      >
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="p-2 transition-colors"
          style={{
            borderRadius: '2px',
            background: editor.isActive('bold') ? 'var(--bg-tertiary)' : 'transparent',
            color: 'var(--text-secondary)',
            border: 'none',
            cursor: 'pointer',
          }}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="p-2 transition-colors"
          style={{
            borderRadius: '2px',
            background: editor.isActive('italic') ? 'var(--bg-tertiary)' : 'transparent',
            color: 'var(--text-secondary)',
            border: 'none',
            cursor: 'pointer',
          }}
          title="Italic"
        >
          <em>I</em>
        </button>

        <div className="w-px h-5 mx-1" style={{ backgroundColor: 'var(--border-light)' }} />

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="p-2 transition-colors text-sm"
          style={{
            borderRadius: '2px',
            background: editor.isActive('bulletList') ? 'var(--bg-tertiary)' : 'transparent',
            color: 'var(--text-secondary)',
            border: 'none',
            cursor: 'pointer',
          }}
          title="Bullet List"
        >
          List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className="p-2 transition-colors text-sm"
          style={{
            borderRadius: '2px',
            background: editor.isActive('blockquote') ? 'var(--bg-tertiary)' : 'transparent',
            color: 'var(--text-secondary)',
            border: 'none',
            cursor: 'pointer',
          }}
          title="Quote"
        >
          Quote
        </button>

        <div className="w-px h-5 mx-1" style={{ backgroundColor: 'var(--border-light)' }} />

        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 transition-colors text-sm"
          style={{
            borderRadius: '2px',
            color: 'var(--text-tertiary)',
            border: 'none',
            cursor: 'pointer',
            opacity: editor.can().undo() ? 1 : 0.3,
          }}
          title="Undo"
        >
          Undo
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 transition-colors text-sm"
          style={{
            borderRadius: '2px',
            color: 'var(--text-tertiary)',
            border: 'none',
            cursor: 'pointer',
            opacity: editor.can().redo() ? 1 : 0.3,
          }}
          title="Redo"
        >
          Redo
        </button>
      </div>

      {/* Editor */}
      <div style={{ borderBottom: '1px solid var(--border-light)' }}>
        <EditorContent editor={editor} />
      </div>

      {/* Tags */}
      <div className="p-6" style={{ borderBottom: '1px solid var(--border-light)' }}>
        <label
          className="block text-xs uppercase tracking-wider mb-3"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Tags
        </label>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 text-sm"
                style={{
                  backgroundColor: 'var(--highlight-gold)',
                  color: 'var(--text-secondary)',
                  borderRadius: '2px',
                }}
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            className="flex-1 text-sm"
            style={{ height: '2.5rem' }}
          />
          <button
            onClick={handleAddTag}
            disabled={!tagInput.trim()}
            className="btn-secondary text-sm"
            style={{ opacity: tagInput.trim() ? 1 : 0.5 }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Bible References */}
      <div className="p-6" style={{ borderBottom: '1px solid var(--border-light)' }}>
        <label
          className="block text-xs uppercase tracking-wider mb-3"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Bible References
        </label>

        {references.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {references.map(ref => (
              <span
                key={ref}
                className="inline-flex items-center gap-1 px-2 py-1 text-sm"
                style={{
                  backgroundColor: 'var(--highlight-sage)',
                  color: 'var(--text-secondary)',
                  borderRadius: '2px',
                }}
              >
                {ref}
                <button
                  onClick={() => handleRemoveReference(ref)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}

        {detectedReferences.length > 0 && detectedReferences.some(ref => !references.includes(ref)) && (
          <div
            className="mb-3 p-3"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '2px',
            }}
          >
            <div className="text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>
              Detected references (click to add):
            </div>
            <div className="flex flex-wrap gap-2">
              {detectedReferences
                .filter(ref => !references.includes(ref))
                .map(ref => (
                  <button
                    key={ref}
                    onClick={() => handleAddReference(ref)}
                    className="px-2 py-1 text-sm transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-secondary)',
                      borderRadius: '2px',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    + {ref}
                  </button>
                ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a reference (e.g., John 3:16)..."
            value={referenceInput}
            onChange={(e) => setReferenceInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddReference(referenceInput);
              }
            }}
            className="flex-1 text-sm"
            style={{ height: '2.5rem' }}
          />
          <button
            onClick={() => handleAddReference(referenceInput)}
            disabled={!referenceInput.trim()}
            className="btn-secondary text-sm"
            style={{ opacity: referenceInput.trim() ? 1 : 0.5 }}
          >
            Add
          </button>
        </div>

        {references.length === 0 && detectedReferences.length === 0 && (
          <p className="text-sm mt-2" style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
            Bible references will be automatically detected as you type
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 flex justify-end gap-3">
        {onCancel && (
          <button
            onClick={onCancel}
            className="btn-secondary text-sm"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={!title.trim() || isSaving}
          className="btn-primary text-sm"
          style={{ opacity: (!title.trim() || isSaving) ? 0.5 : 1 }}
        >
          {isSaving ? 'Saving...' : 'Save Note'}
        </button>
      </div>
    </div>
  );
}
