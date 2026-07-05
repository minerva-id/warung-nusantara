import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Fraunces, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/layout/bottom-nav";
import TopNav from "@/components/layout/top-nav";

const sans = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-geist-sans",
});
const fraunces = Fraunces({ 
  subsets: ["latin"],
  variable: "--font-fraunces",
});
const mono = IBM_Plex_Mono({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Warung Nusantara — Rasa Indonesia di Jepang",
  description: "Toko online mie instan, bumbu dapur, dan kebutuhan konsumsi Indonesia untuk WNI dan pekerja migran Indonesia di Jepang.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#c84b11",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${sans.variable} ${fraunces.variable} ${mono.variable} antialiased bg-muted/30 min-h-screen flex flex-col`}>
        <TopNav />
        <main className="flex-1 w-full max-w-3xl mx-auto bg-background pb-24 md:pb-8 min-h-screen shadow-sm relative">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
