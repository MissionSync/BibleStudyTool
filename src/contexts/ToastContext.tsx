'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, message, type };

    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const getBackgroundColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'var(--highlight-sage)';
      case 'error':
        return 'var(--highlight-peach)';
      case 'info':
        return 'var(--highlight-gold)';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-3 px-4 py-3 animate-slide-in"
            style={{
              backgroundColor: getBackgroundColor(toast.type),
              border: '1px solid var(--border-light)',
              borderRadius: '2px',
              minWidth: '200px',
              maxWidth: '360px',
            }}
            role="alert"
          >
            <p
              className="text-sm flex-1"
              style={{ color: 'var(--text-primary)' }}
            >
              {toast.message}
            </p>
            <button
              onClick={() => dismissToast(toast.id)}
              style={{
                color: 'var(--text-tertiary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
