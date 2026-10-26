/**
 * Optional "buy me a coffee" URL shown in the site footer.
 *
 * Next.js only exposes env vars to the browser when they use the
 * NEXT_PUBLIC_ prefix, so the configured name is
 * NEXT_PUBLIC_STRIPE_SUPPORT_LINK. This constant is the single place
 * that reads it. An unset or empty value hides the link.
 */
export function stripeSupportLinkFromEnv(value: string | undefined | null): string {
  return value?.trim() ?? '';
}

export const STRIPE_SUPPORT_LINK = stripeSupportLinkFromEnv(
  process.env.NEXT_PUBLIC_STRIPE_SUPPORT_LINK,
);
