import {
  CF_WEB_ANALYTICS_SCRIPT_SRC,
  cfWebAnalyticsBeaconAttribute,
} from '../../lib/cfWebAnalytics';

type CloudflareWebAnalyticsProps = {
  token?: string | null;
  nonce?: string;
};

export function CloudflareWebAnalytics({
  token = process.env.NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN,
  nonce,
}: CloudflareWebAnalyticsProps) {
  const beacon = cfWebAnalyticsBeaconAttribute(token);
  if (!beacon) return null;

  return (
    <script
      defer
      src={CF_WEB_ANALYTICS_SCRIPT_SRC}
      data-cf-beacon={beacon}
      nonce={nonce}
    />
  );
}
