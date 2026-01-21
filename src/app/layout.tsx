import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Montserrat_Alternates } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserratAlternates = Montserrat_Alternates({
  variable: "--font-montserrat-alternates",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// (valgfritt men nice) – sørger for hvit “top bar”-feel på mobil
export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export const metadata: Metadata = {
  title: {
    default: "SmerteFri",
    template: "%s • SmerteFri",
  },
  applicationName: "SmerteFri",
  description: "SmerteFri Rehab Platform",

  // ✅ PWA / manifest
  manifest: "/manifest.webmanifest",

  // ✅ iOS “nettapp”
  appleWebApp: {
    capable: true,
    title: "SmerteFri",
    statusBarStyle: "default", // evt "black-translucent"
  },

  // ✅ ikoner (iOS bruker særlig apple-touch-icon)
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },

  // ✅ viktig: dette påvirker ofte hva iOS foreslår som navn i “legg til”
  other: {
    "apple-mobile-web-app-title": "SmerteFri",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no" suppressHydrationWarning>
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          ${montserratAlternates.variable}
          min-h-screen
          bg-sf-bg
          text-sf-text
          antialiased
        `}
      >
        {children}
      </body>
    </html>
  );
}