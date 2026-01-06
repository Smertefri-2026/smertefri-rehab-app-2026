import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Montserrat_Alternates,
} from "next/font/google";
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

export const metadata: Metadata = {
  title: "SmerteFri 2026",
  description: "SmerteFri Rehab Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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