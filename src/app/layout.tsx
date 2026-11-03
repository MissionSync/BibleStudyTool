import type { Metadata, Viewport } from "next";
import { Newsreader, Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { RealtimeProvider } from "@/components/providers/RealtimeProvider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600"],
  style: ["normal", "italic"],
});

const description = "A contemplative space for Scripture study and personal reflection";

export const metadata: Metadata = {
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
  themeColor: "#8a6a45",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${plusJakarta.variable} ${newsreader.variable}`}
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
