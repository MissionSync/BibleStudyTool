import { STRIPE_SUPPORT_LINK } from '@/lib/supportLink';

export function SupportLink() {
  if (!STRIPE_SUPPORT_LINK) return null;

  return (
    <div className="site-footer-support">
      <a
        href={STRIPE_SUPPORT_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-support"
      >
        Enjoying Bible Notes Journal? Buy me a coffee ☕
      </a>
    </div>
  );
}
