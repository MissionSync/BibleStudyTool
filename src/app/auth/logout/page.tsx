'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-300">Signing out...</p>
      </div>
    </div>
  );
}
