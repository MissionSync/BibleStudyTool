import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost, Spectral } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { RealtimeProvider } from "@/components/providers/RealtimeProvider";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

const description = "A contemplative space for Scripture study and personal reflection";
const DEFAULT_SITE_URL = "https://biblenotesjournal.app";

function siteUrlFromEnv(value: string | undefined): URL {
  const configured = value?.trim();
  return new URL(configured ? configured : DEFAULT_SITE_URL);
}

export const metadata: Metadata = {
  metadataBase: siteUrlFromEnv(process.env.NEXT_PUBLIC_SITE_URL),
  title: "Bible Notes Journal",
  description,
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bible Notes Journal",
  },
  openGraph: {
    title: "Bible Notes Journal",
    description,
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Bible Notes Journal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bible Notes Journal",
    description,
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f0e3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${spectral.variable} ${jost.variable}`}
    >
      <body>
        <QueryProvider>
          <ThemeProvider>
            <AuthProvider>
              <RealtimeProvider>
                <ToastProvider>
                  <OfflineBanner />
                  {children}
                </ToastProvider>
              </RealtimeProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
