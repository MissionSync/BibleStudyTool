'use client';

import { useEffect, useState } from 'react';

const HINT_KEY = 'studyMapHintDismissed';

export function StudyMapHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(HINT_KEY) !== 'true') {
        setVisible(true);
      }
    } catch {
      // Ignore storage errors. The hint is optional.
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(HINT_KEY, 'true');
    } catch {
      // Ignore storage errors.
    }
    setVisible(false);
  };

  return (
    <div
      className="flex-shrink-0 px-6 py-3"
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-light)',
      }}
    >
      <div className="flex items-start justify-between gap-4" style={{ maxWidth: 'var(--content-wide)', margin: '0 auto' }}>
        <div>
          <p className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
            How to use your study map
          </p>
          <ol className="text-sm space-y-1" style={{ color: 'var(--text-secondary)', paddingLeft: '1.25rem' }}>
            <li>Search your notes and verses.</li>
            <li>Use the filters to focus on books, verses, notes, themes, people, or places.</li>
            <li>Click an item to see details.</li>
          </ol>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="text-sm flex-shrink-0"
          style={{ color: 'var(--accent)', background: 'none', border: 'none', padding: 0 }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
