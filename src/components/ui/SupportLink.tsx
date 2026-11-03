import { STRIPE_SUPPORT_LINK } from '@/lib/supportLink';

export function SupportLink() {
  if (!STRIPE_SUPPORT_LINK) return null;

  return (
    <a
      href={STRIPE_SUPPORT_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-support"
    >
      ☕ Support this project
    </a>
  );
}
