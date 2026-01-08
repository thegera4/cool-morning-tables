import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ClerkProvider } from "@clerk/nextjs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SanityUserSync } from "@/components/SanityUserSync";
import { SanityLive } from "@/sanity/lib/live";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cool Morning Cenas",
  description: "Experiencia Cool Morning en columpios con cena incluida",
  authors: [{ name: "Juan Gerardo Medellin Ibarra", url: "https://www.jgmedellin.com/" }],
  generator: "Next.js",
  keywords: ["Cool Morning", "Cenas", "Columpios", "Cena Incluida", "Experiencias"],
  openGraph: {
    title: "Cool Morning Cenas",
    description: "Experiencia Cool Morning en columpios con cena incluida",
    siteName: "Cool Morning Cenas",
    images: [
      {
        url: "/Logo.png",
        width: 1200,
        height: 630,
        alt: "Cool Morning Cenas",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <ClerkProvider>
      <html lang="es" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
          <TooltipProvider>
            <SanityUserSync />
            {children}
            <SanityLive />
            <Toaster />
            <Analytics />
            <SpeedInsights />
          </TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}