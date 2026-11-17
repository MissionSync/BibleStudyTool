export type ThemePreference = 'light' | 'dark';

/** Stored choice wins. Otherwise follow the system color scheme. */
export function resolveThemePreference(
  stored: string | null,
  prefersDark: boolean,
): { theme: ThemePreference; explicit: boolean } {
  if (stored === 'light' || stored === 'dark') {
    return { theme: stored, explicit: true };
  }
  return { theme: prefersDark ? 'dark' : 'light', explicit: false };
}
