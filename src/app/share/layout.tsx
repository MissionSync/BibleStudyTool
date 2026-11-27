import { headers } from 'next/headers';
import { CloudflareWebAnalytics } from '@/components/analytics/CloudflareWebAnalytics';

export default async function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // /share CSP uses 'strict-dynamic', which ignores the script-src host
  // allowlist. The beacon carries this request's nonce so it can run.
  const nonce = (await headers()).get('x-nonce') || undefined;

  return (
    <>
      <CloudflareWebAnalytics nonce={nonce} />
      {children}
    </>
  );
}
