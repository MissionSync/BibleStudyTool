'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { usePrayers } from '@/hooks/usePrayers';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { type Prayer } from '@/lib/appwrite/prayers';

const PRAYER_MAX_LENGTH = 255;

function PrayerCard({
  prayer,
  currentUserId,
  onMarkAnswered,
  onDelete,
}: {
  prayer: Prayer;
  currentUserId: string;
  onMarkAnswered: (prayer: Prayer) => void;
  onDelete: (prayerId: string) => void;
}) {
  const isOwner = prayer.userId === currentUserId;

  return (
    <div
      className="p-5"
      style={{ borderBottom: '1px solid var(--border-light)' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3
              className="text-lg truncate"
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--text-primary)',
                fontWeight: 400,
              }}
            >
              {prayer.title}
            </h3>
            {!prayer.isPublic && (
              <span
                className="text-xs px-2 py-0.5 flex-shrink-0"
                style={{
                  backgroundColor: 'var(--highlight-peach)',
                  color: 'var(--text-secondary)',
                  borderRadius: 'var(--radius-pill)',
                }}
              >
                Private
              </span>
            )}
            {prayer.prayerAnswered && (
              <span
                className="text-xs px-2 py-0.5 flex-shrink-0"
                style={{
                  backgroundColor: 'var(--highlight-sage)',
                  color: 'var(--text-secondary)',
                  borderRadius: 'var(--radius-pill)',
                }}
              >
                Answered
              </span>
            )}
          </div>

          <p
            className="text-sm mb-3"
            style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
          >
            {prayer.prayer}
          </p>

          {prayer.prayerAnswered && (
            <div
              className="p-3 mb-3"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-sm)',
                borderLeft: '3px solid var(--accent)',
              }}
            >
              <p
                className="text-xs uppercase tracking-wider mb-1"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Prayer Answered
              </p>
              <p className="text-sm" style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {prayer.prayerAnswered}
              </p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {new Date(prayer.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            {!isOwner && (
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                by {prayer.userName}
              </span>
            )}
          </div>
        </div>

        {isOwner && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {!prayer.prayerAnswered && (
              <button
                onClick={() => onMarkAnswered(prayer)}
                className="text-sm transition-colors"
                style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Mark Answered
              </button>
            )}
            <button
              onClick={() => onDelete(prayer.$id)}
              className="text-sm transition-colors"
              style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PrayerPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const {
    recentPrayers,
    userPrayers,
    isLoadingRecent,
    isLoadingUser,
    recentError,
    createPrayer,
    updatePrayer,
    deletePrayer,
  } = usePrayers(user?.$id);

  const [activeTab, setActiveTab] = useState<'community' | 'mine'>('community');
  const [showForm, setShowForm] = useState(false);
  const [answeringPrayer, setAnsweringPrayer] = useState<Prayer | null>(null);
  const [answerText, setAnswerText] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [prayerText, setPrayerText] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  const resetForm = () => {
    setTitle('');
    setPrayerText('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsPublic(true);
    setShowForm(false);
  };

  const handleSubmitPrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const trimmedTitle = title.trim();
    const trimmedPrayer = prayerText.trim();

    if (!trimmedTitle || !trimmedPrayer) {
      showToast('Please fill in both title and prayer request.', 'error');
      return;
    }

    if (trimmedPrayer.length > PRAYER_MAX_LENGTH) {
      showToast(`Prayer request must be ${PRAYER_MAX_LENGTH} characters or less.`, 'error');
      return;
    }

    try {
      await createPrayer.mutateAsync({
        userId: user.$id,
        userName: user.name,
        title: trimmedTitle,
        prayer: trimmedPrayer,
        date,
        isPublic,
      });
      showToast('Prayer request submitted.', 'success');
      resetForm();
    } catch {
      showToast('Failed to submit prayer request.', 'error');
    }
  };

  const handleMarkAnswered = (prayer: Prayer) => {
    setAnsweringPrayer(prayer);
    setAnswerText('');
  };

  const handleSubmitAnswer = async () => {
    if (!answeringPrayer || !answerText.trim()) return;

    try {
      await updatePrayer.mutateAsync({
        prayerId: answeringPrayer.$id,
        data: { prayerAnswered: answerText.trim() },
      });
      showToast('Prayer marked as answered.', 'success');
      setAnsweringPrayer(null);
      setAnswerText('');
    } catch {
      showToast('Failed to update prayer.', 'error');
    }
  };

  const handleDeletePrayer = async (prayerId: string) => {
    if (!confirm('Are you sure you want to delete this prayer request?')) return;

    try {
      await deletePrayer.mutateAsync(prayerId);
      showToast('Prayer request deleted.', 'success');
    } catch {
      showToast('Failed to delete prayer request.', 'error');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayedPrayers = activeTab === 'community' ? recentPrayers : userPrayers;
  const isLoading = activeTab === 'community' ? isLoadingRecent : isLoadingUser;
  const loadError = activeTab === 'community' ? recentError : null;

  return (
    <div className="min-h-screen animate-fade-in" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Navigation */}
      <nav
        className="content-wide py-6 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border-light)' }}
      >
        <Link
          href="/dashboard"
          className="text-lg tracking-wide"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', textDecoration: 'none' }}
        >
          Bible Notes Journal
        </Link>
        <div className="flex items-center gap-8">
          <Link href="/study" className="text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}>
            Study Plans
          </Link>
          <Link href="/notes" className="text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}>
            Notes
          </Link>
          <span
            className="text-sm"
            style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--text-primary)', paddingBottom: '2px' }}
          >
            Prayer
          </span>
          <ThemeToggle />
        </div>
      </nav>

      {/* Header */}
      <header className="content-narrow py-12">
        <Link
          href="/dashboard"
          className="inline-block mb-6 text-sm transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          &larr; Dashboard
        </Link>

        <div className="flex items-start justify-between gap-6">
          <div>
            <h1
              className="text-3xl mb-2"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontWeight: 400 }}
            >
              Prayer Requests
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Share and support one another in prayer
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary text-sm"
          >
            {showForm ? 'Cancel' : 'New Prayer'}
          </button>
        </div>
      </header>

      <main className="content-narrow pb-16">
        {/* Prayer Request Form */}
        {showForm && (
          <form
            onSubmit={handleSubmitPrayer}
            className="mb-8 p-6"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <h2
              className="text-xl mb-6"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontWeight: 400 }}
            >
              New Prayer Request
            </h2>

            <div className="mb-4">
              <label
                className="block text-sm mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full"
                style={{ height: '3rem' }}
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-sm mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Prayer request title"
                required
                className="w-full"
                style={{ height: '3rem' }}
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-sm mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Prayer Request
                <span className="ml-2" style={{ color: prayerText.length > PRAYER_MAX_LENGTH ? 'var(--error)' : 'var(--text-tertiary)' }}>
                  ({prayerText.length}/{PRAYER_MAX_LENGTH})
                </span>
              </label>
              <textarea
                value={prayerText}
                onChange={(e) => setPrayerText(e.target.value)}
                placeholder="Share your prayer request..."
                required
                maxLength={PRAYER_MAX_LENGTH}
                rows={4}
                className="w-full"
                style={{
                  padding: '0.75rem 1rem',
                  resize: 'vertical',
                }}
              />
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  style={{ width: '1rem', height: '1rem', accentColor: 'var(--accent)' }}
                />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Share publicly with the community
                </span>
              </label>
              <p className="text-xs mt-1 ml-7" style={{ color: 'var(--text-tertiary)' }}>
                Private prayers are only visible to you
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createPrayer.isPending}
                className="btn-primary text-sm"
              >
                {createPrayer.isPending ? 'Submitting...' : 'Submit Prayer'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Answer Prayer Modal */}
        {answeringPrayer && (
          <div
            className="mb-8 p-6"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <h2
              className="text-xl mb-2"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontWeight: 400 }}
            >
              Mark Prayer as Answered
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              &ldquo;{answeringPrayer.title}&rdquo;
            </p>

            <div className="mb-4">
              <label
                className="block text-sm mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                How was this prayer answered?
              </label>
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Share how God answered this prayer..."
                rows={3}
                className="w-full"
                style={{
                  padding: '0.75rem 1rem',
                  resize: 'vertical',
                }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmitAnswer}
                disabled={!answerText.trim() || updatePrayer.isPending}
                className="btn-primary text-sm"
              >
                {updatePrayer.isPending ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => { setAnsweringPrayer(null); setAnswerText(''); }}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {loadError && (
          <div
            className="mb-6 p-4"
            style={{
              backgroundColor: 'var(--highlight-peach)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--error)' }}>
              Unable to load prayers. Please check your connection.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-6 mb-8" style={{ borderBottom: '1px solid var(--border-light)' }}>
          <button
            onClick={() => setActiveTab('community')}
            className="pb-3 text-sm transition-colors"
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'community' ? '2px solid var(--text-primary)' : '2px solid transparent',
              color: activeTab === 'community' ? 'var(--text-primary)' : 'var(--text-tertiary)',
              cursor: 'pointer',
              fontWeight: activeTab === 'community' ? 500 : 400,
            }}
          >
            Community
          </button>
          <button
            onClick={() => setActiveTab('mine')}
            className="pb-3 text-sm transition-colors"
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'mine' ? '2px solid var(--text-primary)' : '2px solid transparent',
              color: activeTab === 'mine' ? 'var(--text-primary)' : 'var(--text-tertiary)',
              cursor: 'pointer',
              fontWeight: activeTab === 'mine' ? 500 : 400,
            }}
          >
            My Prayers
          </button>
        </div>

        {/* Prayer List */}
        {isLoading ? (
          <div className="space-y-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-5" style={{ borderBottom: '1px solid var(--border-light)' }}>
                <div className="skeleton" style={{ width: '40%', height: '1.25rem', marginBottom: '0.75rem' }} />
                <div className="skeleton" style={{ width: '100%', height: '0.875rem', marginBottom: '0.5rem' }} />
                <div className="skeleton" style={{ width: '60%', height: '0.875rem', marginBottom: '0.75rem' }} />
                <div className="skeleton" style={{ width: '25%', height: '0.75rem' }} />
              </div>
            ))}
          </div>
        ) : displayedPrayers.length === 0 ? (
          <div
            className="text-center"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '4px',
              padding: '3rem 2rem',
            }}
          >
            <h3
              className="text-xl mb-3"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontWeight: 400 }}
            >
              {activeTab === 'community' ? 'No community prayers yet' : 'No prayers yet'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {activeTab === 'community'
                ? 'Be the first to share a prayer request with the community'
                : 'Start by submitting your first prayer request'}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary text-sm"
            >
              Submit a Prayer Request
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {displayedPrayers.map((prayer) => (
              <PrayerCard
                key={prayer.$id}
                prayer={prayer}
                currentUserId={user.$id}
                onMarkAnswered={handleMarkAnswered}
                onDelete={handleDeletePrayer}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="py-12 text-center text-sm"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <div>Bible Notes Journal</div>
        <div style={{ marginTop: '0.5rem' }}>
          developed by{' '}
          <a
            href="https://missionsynclab.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent)', textDecoration: 'none' }}
          >
            MissionSync Lab
          </a>
        </div>
      </footer>
    </div>
  );
}
