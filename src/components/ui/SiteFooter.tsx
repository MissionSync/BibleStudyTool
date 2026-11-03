import { PoietesCredit } from '@/components/ui/PoietesCredit';
import { SupportLink } from '@/components/ui/SupportLink';

const TAGLINE = 'A contemplative space for Scripture study and personal reflection';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="content-wide site-footer-inner">
        <div className="site-footer-group">
          <div className="site-footer-name">Bible Notes Journal</div>
          <p className="site-footer-tagline">{TAGLINE}</p>
        </div>
        <div className="site-footer-group">
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
          <a
            href="https://missionsynclab.com"
            target="_blank"
            rel="noopener noreferrer"
            className="site-footer-link"
          >
            Built by MissionSync Lab: websites for churches and ministries
          </a>
        </div>
        <SupportLink />
      </div>
    </footer>
  );
}
