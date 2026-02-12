import type { Metadata, Viewport } from "next";
import { Crimson_Pro, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { RealtimeProvider } from "@/components/providers/RealtimeProvider";

const crimsonPro = Crimson_Pro({
  variable: "--font-crimson",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Bible Notes Journal",
  description: "A contemplative space for Scripture study and personal reflection",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bible Notes",
  },
};

export const viewport: Viewport = {
  themeColor: "#7C9082",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${crimsonPro.variable} ${sourceSans.variable}`}>
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
