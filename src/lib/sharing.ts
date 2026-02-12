export function generateShareToken(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

export function getShareUrl(token: string): string {
  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || '';
  return `${baseUrl}/share/${token}`;
}
