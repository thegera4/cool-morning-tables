import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ClerkProvider } from "@clerk/nextjs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SanityUserSync } from "@/components/SanityUserSync";
import { SanityLive } from "@/sanity/lib/live";
import { Toaster } from "@/components/ui/sonner";
import JsonLd from "@/components/JsonLd";
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
  metadataBase: new URL("https://cool-morning-tables.vercel.app/"),
  title: {
    default: "Cool Morning Cenas - Experiencias Únicas en Columpios",
    template: "%s | Cool Morning Cenas",
  },
  description: "Disfruta de una cena inolvidable en nuestros columpios exclusivos. Experiencia Cool Morning con gastronomía de primer nivel y ambiente mágico.",
  authors: [{ name: "Juan Gerardo Medellin Ibarra", url: "https://www.jgmedellin.com/" }],
  generator: "Next.js",
  keywords: [
    "Cool Morning",
    "Cenas",
    "Columpios",
    "Cena Romántica",
    "Experiencias Gastronómicas",
    "Restaurante con Columpios",
    "Cena Incluida",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Cool Morning Cenas - Experiencias Únicas en Columpios",
    description: "Disfruta de una cena inolvidable en nuestros columpios exclusivos. Experiencia Cool Morning con gastronomía de primer nivel.",
    url: "https://cool-morning-tables.vercel.app/",
    siteName: "Cool Morning Cenas",
    locale: "es_MX",
    type: "website",
    images: [
      {
        url: "/Logo.png",
        width: 1200,
        height: 630,
        alt: "Cool Morning Cenas Experiencia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cool Morning Cenas",
    description: "Experiencia Cool Morning en columpios con cena incluida",
    images: ["/Logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
            <JsonLd />
            <Analytics />
            <SpeedInsights />
          </TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}