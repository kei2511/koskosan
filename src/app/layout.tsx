import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "KOMA - Kelola Kos Makin Mudah",
    template: "%s | KOMA",
  },
  description: "KOMA (Kost Manager App) - Aplikasi SaaS untuk manajemen kos-kosan. Kelola properti, kamar, penyewa, dan tagihan dengan mudah.",
  keywords: ["kos", "kosan", "manajemen kos", "rental", "properti", "koma"],
  authors: [{ name: "KOMA" }],
  applicationName: "KOMA",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a2e" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

