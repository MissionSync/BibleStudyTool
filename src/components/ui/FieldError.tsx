'use client';

export function FieldError({ message }: { message?: string | null }) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="mt-1 text-xs"
      style={{ color: 'var(--error)' }}
    >
      {message}
    </p>
  );
}
