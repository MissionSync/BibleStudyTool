'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

export default function LogoutPage() {
  const { logout } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      await logout();
      showToast('Goodbye! See you next time.', 'success');
      router.push('/');
    };

    performLogout();
  }, [logout, router, showToast]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="text-center">
        <div className="spinner mx-auto mb-4" style={{ width: '32px', height: '32px' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Signing out...</p>
      </div>
    </div>
  );
}
