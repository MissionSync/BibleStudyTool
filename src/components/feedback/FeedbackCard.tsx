'use client';

import { useEffect, useState } from 'react';
import { hasInAppFeedback, submitInAppFeedback } from '@/lib/appwrite/feedback';

const DISMISS_KEY = (userId: string) => `feedbackCardDismissed:${userId}`;

const HELP_OPTIONS = [
  'clearer labels',
  'a color key',
  'only this week',
  'simpler layout',
  'a picture I can save',
] as const;

const WEEK_OPTIONS = ["That week's reading", 'Everything'] as const;

interface FeedbackCardProps {
  userId: string;
  className?: string;
}

export function FeedbackCard({ userId, className }: FeedbackCardProps) {
  const [open, setOpen] = useState(false);
  const [ease, setEase] = useState<number | null>(null);
  const [weekView, setWeekView] = useState('');
  const [helpMost, setHelpMost] = useState('');
  const [confusing, setConfusing] = useState('');
  const [change, setChange] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    try {
      if (localStorage.getItem(DISMISS_KEY(userId)) === 'true') {
        return;
      }
    } catch {
      // Ignore storage errors and still ask in the app.
    }

    hasInAppFeedback(userId).then((hasResponse) => {
      if (!cancelled && hasResponse === false) {
        setOpen(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (!open) return null;

  const skip = () => {
    try {
      localStorage.setItem(DISMISS_KEY(userId), 'true');
    } catch {
      // Hiding the card still works for this visit.
    }
    setOpen(false);
  };

  const submit = async () => {
    if (ease == null || !weekView || !helpMost || saving) return;
    setSaving(true);
    setSaveError(null);
    const saved = await submitInAppFeedback(userId, {
      ease,
      weekView,
      helpMost,
      confusing: confusing.trim(),
      change: change.trim(),
    });
    setSaving(false);
    if (saved) {
      setOpen(false);
      return;
    }
    setSaveError('We could not save your answers. The rest of the app still works.');
  };

  return (
    <section
      className={className ? `p-5 ${className}` : 'p-5'}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2
            className="text-lg"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontWeight: 400 }}
          >
            Five quick questions
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            This helps us make the study map easier to follow.
          </p>
        </div>
        <button
          type="button"
          onClick={skip}
          className="text-sm"
          style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', padding: 0 }}
        >
          Skip
        </button>
      </div>

      <div className="space-y-5">
        <fieldset>
          <legend className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
            How easy is the study map to understand? (1–5)
          </legend>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => setEase(score)}
                className="text-sm"
                style={{
                  width: '2.25rem',
                  height: '2.25rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  background: ease === score ? 'var(--accent)' : 'var(--bg-primary)',
                  color: ease === score ? 'var(--bg-primary)' : 'var(--text-secondary)',
                }}
                aria-label={`${score}`}
              >
                {score}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
            When you open a week, do you want that week&apos;s reading, or everything?
          </legend>
          <div className="flex flex-wrap gap-2">
            {WEEK_OPTIONS.map((option) => (
              <label key={option} className="text-sm flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <input
                  type="radio"
                  name="week-view"
                  value={option}
                  checked={weekView === option}
                  onChange={() => setWeekView(option)}
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
            Which would help most?
          </legend>
          <div className="flex flex-col gap-1">
            {HELP_OPTIONS.map((option) => (
              <label key={option} className="text-sm flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <input
                  type="radio"
                  name="help-most"
                  value={option}
                  checked={helpMost === option}
                  onChange={() => setHelpMost(option)}
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
            What is confusing right now? (optional short text)
          </span>
          <input
            type="text"
            value={confusing}
            maxLength={400}
            onChange={(event) => setConfusing(event.target.value)}
            className="w-full text-sm mt-2"
            style={{ height: '2.5rem' }}
          />
        </label>

        <label className="block">
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
            What else should we change? (optional short text)
          </span>
          <input
            type="text"
            value={change}
            maxLength={400}
            onChange={(event) => setChange(event.target.value)}
            className="w-full text-sm mt-2"
            style={{ height: '2.5rem' }}
          />
        </label>
      </div>

      {saveError && (
        <p className="text-sm mt-4" style={{ color: 'var(--error)' }}>{saveError}</p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={ease == null || !weekView || !helpMost || saving}
        className="btn-primary text-sm mt-5"
      >
        {saving ? 'Saving...' : 'Send answers'}
      </button>
    </section>
  );
}
