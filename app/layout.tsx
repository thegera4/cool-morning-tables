import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
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
  title: "Cool Morning Columpios",
  description: "Experiencia Cool Morning en columpios con cena incluida",
};

import { TooltipProvider } from "@/components/ui/tooltip";
import { SanityUserSync } from "@/components/SanityUserSync";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <TooltipProvider>
            <SanityUserSync />
            {children}
          </TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
