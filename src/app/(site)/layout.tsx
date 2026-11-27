import { CloudflareWebAnalytics } from '@/components/analytics/CloudflareWebAnalytics';

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CloudflareWebAnalytics />
      {children}
    </>
  );
}
