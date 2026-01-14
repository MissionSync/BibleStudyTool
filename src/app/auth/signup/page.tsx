'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

export default function SignupPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, name);
      await refreshUser();
      showToast('Welcome to Bible Notes Journal.', 'success');
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create account. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 animate-fade-in" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="w-full" style={{ maxWidth: '24rem' }}>
        {/* Back */}
        <Link
          href="/"
          className="inline-block mb-10 text-sm transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          &larr; Back
        </Link>

        {/* Header */}
        <div className="mb-10">
          <h1
            className="text-3xl mb-2"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontWeight: 400 }}
          >
            Create account
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Begin your study journey
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mb-6 p-4"
            style={{
              backgroundColor: 'var(--highlight-peach)',
              border: '1px solid var(--border-light)',
              borderRadius: '2px',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--error)' }}>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label
              htmlFor="name"
              className="block text-sm mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className="w-full"
              style={{ height: '3rem' }}
            />
          </div>

          <div className="mb-5">
            <label
              htmlFor="email"
              className="block text-sm mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full"
              style={{ height: '3rem' }}
            />
          </div>

          <div className="mb-5">
            <label
              htmlFor="password"
              className="block text-sm mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full"
              style={{ height: '3rem' }}
            />
            <p className="mt-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              At least 8 characters
            </p>
          </div>

          <div className="mb-8">
            <label
              htmlFor="confirmPassword"
              className="block text-sm mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full"
              style={{ height: '3rem' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center"
            style={{ height: '3rem' }}
          >
            {loading ? (
              <span className="spinner" style={{ width: '18px', height: '18px', borderColor: 'var(--bg-primary)', borderTopColor: 'var(--accent)' }} />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
          Have an account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--accent)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
