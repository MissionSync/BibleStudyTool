import { STRIPE_SUPPORT_LINK } from '@/lib/supportLink';

export function SupportLink() {
  if (!STRIPE_SUPPORT_LINK) return null;

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <a
        href={STRIPE_SUPPORT_LINK}
        target="_blank"
        rel="noopener"
        style={{ color: 'var(--accent)', textDecoration: 'none' }}
      >
        Enjoying Bible Notes Journal? Buy me a coffee ☕
      </a>
    </div>
  );
}
