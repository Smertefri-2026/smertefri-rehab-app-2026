// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Montserrat_Alternates } from "next/font/google";
import Script from "next/script";
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

// ✅ Read env at module scope (recommended)
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  title: {
    default: "SmerteFri",
    template: "%s • SmerteFri",
  },
  description: "SmerteFri Rehab Platform",
  applicationName: "SmerteFri",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "SmerteFri",
    statusBarStyle: "default",
  },
  themeColor: "#FFFFFF",
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no" suppressHydrationWarning>
      {/* ✅ Google Analytics (GA4) – only if NEXT_PUBLIC_GA_ID is set */}
      {GA_ID ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', {
                anonymize_ip: true,
                // If you ever want to handle pageviews manually in SPA routes:
                // send_page_view: false
              });
            `}
          </Script>
        </>
      ) : null}

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