import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PasswordGate from "@/components/PasswordGate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Triple Burden — Poverty, Climate Risk & Sanitation",
    template: "%s · Triple Burden",
  },
  description:
    "Explore the convergence of poverty, climate risk, and inadequate sanitation across urban districts in 217 countries. Interactive maps, district-level data, and case studies.",
  keywords: [
    "triple burden",
    "urban poverty",
    "climate risk",
    "sanitation",
    "World Bank",
    "developing countries",
    "flood risk",
    "water stress",
  ],
  openGraph: {
    title: "Triple Burden — Poverty, Climate Risk & Sanitation",
    description:
      "Interactive exploration of the triple burden across urban districts worldwide.",
    type: "website",
    siteName: "Triple Burden",
  },
  twitter: {
    card: "summary_large_image",
    title: "Triple Burden — Poverty, Climate Risk & Sanitation",
    description:
      "Interactive exploration of the triple burden across urban districts worldwide.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a7f8e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PasswordGate>{children}</PasswordGate>
      </body>
    </html>
  );
}
