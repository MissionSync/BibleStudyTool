import Link from 'next/link';
import { PoietesCredit } from '@/components/ui/PoietesCredit';
import { SupportLink } from '@/components/ui/SupportLink';

const TAGLINE = 'A contemplative space for Scripture study and personal reflection';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap site-footer-inner">
        <Link href="/" className="brand-mark brand-mark--footer">
          Bible Notes Journal
        </Link>
        <p className="site-footer-tagline">{TAGLINE}</p>
        <p className="site-footer-credit">
          Developed by{' '}
          <a
            href="https://missionsynclab.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="site-footer-link"
          >
            MissionSync Lab
          </a>
          <PoietesCredit />
        </p>
        <SupportLink />
      </div>
    </footer>
  );
}
