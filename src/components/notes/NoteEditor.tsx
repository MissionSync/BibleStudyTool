// components/notes/NoteEditor.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo,
  Save,
  Tag as TagIcon,
  BookOpen,
  X
} from 'lucide-react';

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
  const [isSaving, setIsSaving] = useState(false);
  const [detectedReferences, setDetectedReferences] = useState<string[]>([]);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4',
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
    if (!references.includes(ref)) {
      setReferences([...references, ref]);
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
    <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="p-6 border-b">
        <input
          type="text"
          placeholder="Note title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-2xl font-bold focus:outline-none placeholder:text-gray-400"
        />
      </div>

      <div className="flex items-center gap-1 p-3 border-b bg-gray-50 flex-wrap">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
        >
          <Italic className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('blockquote') ? 'bg-gray-200' : ''}`}
        >
          <Quote className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-30"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-30"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      <div className="border-b">
        <EditorContent editor={editor} />
      </div>

      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <TagIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Tags</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleAddTag}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      </div>

      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Bible References</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {references.map(ref => (
            <span
              key={ref}
              className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm"
            >
              {ref}
              <button
                onClick={() => handleRemoveReference(ref)}
                className="hover:bg-emerald-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        {detectedReferences.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 mb-2">
              Detected references (click to add):
            </div>
            <div className="flex flex-wrap gap-2">
              {detectedReferences
                .filter(ref => !references.includes(ref))
                .map(ref => (
                  <button
                    key={ref}
                    onClick={() => handleAddReference(ref)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                  >
                    + {ref}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 flex justify-end gap-3">
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={!title.trim() || isSaving}
          className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Note'}
        </button>
      </div>
    </div>
  );
}
