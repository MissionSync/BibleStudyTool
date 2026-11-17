// components/notes/NoteEditor.tsx
'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { validateNoteTitle } from '@/lib/validation';
import { FieldError } from '@/components/ui/FieldError';

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
  error?: string | null;
}

export function NoteEditor({
  initialTitle = '',
  initialContent = '',
  initialTags = [],
  initialReferences = [],
  onSave,
  onCancel,
  error: parentError,
}: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState('');
  const [references, setReferences] = useState<string[]>(initialReferences);
  const [referenceInput, setReferenceInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [detectedReferences, setDetectedReferences] = useState<string[]>([]);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const growTitle = useCallback(() => {
    const field = titleRef.current;
    if (!field) return;
    field.style.height = 'auto';
    const border = field.offsetHeight - field.clientHeight;
    field.style.height = `${field.scrollHeight + border}px`;
  }, []);

  useEffect(() => {
    growTitle();
    const fonts = document.fonts;
    if (!fonts) return;
    let cancel = false;
    fonts.ready.then(() => {
      if (!cancel) growTitle();
    });
    return () => {
      cancel = true;
    };
  }, [title, growTitle]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'note-editor-prose max-w-none focus:outline-none min-h-[300px]',
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

  const handleTitleBlur = useCallback(() => {
    const result = validateNoteTitle(title);
    setTitleError(result.valid ? null : result.message ?? null);
  }, [title]);

  const handleSave = useCallback(async () => {
    const validation = validateNoteTitle(title);
    if (!validation.valid) {
      setTitleError(validation.message ?? null);
      return;
    }
    if (!editor) return;

    setTitleError(null);
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
    <div className="editor-card">
      {/* Parent error */}
      {parentError && (
        <div
          className="p-4 m-6 mb-0"
          style={{
            backgroundColor: 'var(--highlight-peach)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <p style={{ color: 'var(--error)', fontSize: '1rem', lineHeight: 1.5 }}>{parentError}</p>
        </div>
      )}

      {/* Title */}
      <div className="editor-block" style={{ borderBottom: '1px solid var(--border-light)' }}>
        <div className="flex items-center justify-between mb-2 gap-3">
          <label htmlFor="note-title" className="editor-label" style={{ marginBottom: 0 }}>
            Title
          </label>
          <span style={{ color: title.length > 200 ? 'var(--error)' : 'var(--text-tertiary)', fontSize: '0.875rem' }}>
            {title.length}/200
          </span>
        </div>
        <textarea
          ref={titleRef}
          id="note-title"
          rows={1}
          placeholder="Enter your note title..."
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (titleError) setTitleError(null);
          }}
          onBlur={handleTitleBlur}
          maxLength={200}
          className="note-title-field"
          style={{
            border: `1px solid ${titleError ? 'var(--error)' : 'var(--border-light)'}`,
          }}
        />
        <FieldError message={titleError} />
      </div>

      {/* Toolbar */}
      <div className="editor-toolbar" role="toolbar" aria-label="Note formatting">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          type="button"
          className="editor-tool"
          aria-pressed={editor.isActive('bold')}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          type="button"
          className="editor-tool"
          aria-pressed={editor.isActive('italic')}
          title="Italic"
        >
          <em>I</em>
        </button>
        <div className="editor-divider" />
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          type="button"
          className="editor-tool"
          aria-pressed={editor.isActive('bulletList')}
          title="Bullet List"
        >
          List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          type="button"
          className="editor-tool"
          aria-pressed={editor.isActive('blockquote')}
          title="Quote"
        >
          Quote
        </button>
        <div className="editor-divider" />
        <button
          onClick={() => editor.chain().focus().undo().run()}
          type="button"
          disabled={!editor.can().undo()}
          className="editor-tool"
          style={{ opacity: editor.can().undo() ? 1 : 0.35 }}
          title="Undo"
        >
          Undo
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          type="button"
          disabled={!editor.can().redo()}
          className="editor-tool"
          style={{ opacity: editor.can().redo() ? 1 : 0.35 }}
          title="Redo"
        >
          Redo
        </button>
      </div>

      <div
        className="editor-surface"
        style={{
          borderBottom: '1px solid var(--border-light)',
          backgroundColor: 'var(--bg-primary)',
          minHeight: '300px',
        }}
      >
        <EditorContent editor={editor} />
      </div>

      <div className="editor-block" style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-card)' }}>
        <label className="editor-label">Tags</label>

        {tags.length > 0 && (
          <div className="chip-row mb-3">
            {tags.map(tag => (
              <span key={tag} className="tag-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  aria-label={`Remove tag ${tag}`}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '0 2px', fontSize: '1.1rem', lineHeight: 1 }}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="editor-compose">
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
          />
          <button
            type="button"
            onClick={handleAddTag}
            disabled={!tagInput.trim()}
            className="btn-secondary"
            style={{ opacity: tagInput.trim() ? 1 : 0.5 }}
          >
            Add
          </button>
        </div>
      </div>

      <div className="editor-block" style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-card)' }}>
        <label className="editor-label">Bible References</label>

        {references.length > 0 && (
          <div className="chip-row mb-3">
            {references.map(ref => (
              <span key={ref} className="verse-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                {ref}
                <button
                  type="button"
                  onClick={() => handleRemoveReference(ref)}
                  aria-label={`Remove reference ${ref}`}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '0 2px', fontSize: '1.1rem', lineHeight: 1 }}
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
              border: '1px solid var(--border-light)',
            }}
          >
            <div className="mb-2" style={{ color: 'var(--text-tertiary)', fontSize: '1rem', lineHeight: 1.5 }}>
              Detected references (click to add):
            </div>
            <div className="chip-row">
              {detectedReferences
                .filter(ref => !references.includes(ref))
                .map(ref => (
                  <button
                    type="button"
                    key={ref}
                    onClick={() => handleAddReference(ref)}
                    className="verse-chip"
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    + {ref}
                  </button>
                ))}
            </div>
          </div>
        )}

        <div className="editor-compose">
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
          />
          <button
            type="button"
            onClick={() => handleAddReference(referenceInput)}
            disabled={!referenceInput.trim()}
            className="btn-secondary"
            style={{ opacity: referenceInput.trim() ? 1 : 0.5 }}
          >
            Add
          </button>
        </div>

        {references.length === 0 && detectedReferences.length === 0 && (
          <p className="mt-3" style={{ color: 'var(--text-tertiary)', fontSize: '1rem', lineHeight: 1.5, fontStyle: 'italic' }}>
            Bible references will be automatically detected as you type
          </p>
        )}
      </div>

      <div className="editor-actions">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary text-sm"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
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
