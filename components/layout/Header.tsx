"use client"

import Link from "next/link";
import Image from "next/image";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const isReservationsPage = pathname === "/reservas";

  return (
    <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12">
      <div className="flex items-center">
        <Link href="/" className="relative h-10 w-32 md:h-12 md:w-48">
          <Image
            src="/Logo.png"
            alt="Cool Morning Logo"
            fill
            className="object-contain object-left"
            priority
          />
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-6">
        <Link
          href="/CENA%20COLUMPIOS%202026.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white text-sm font-medium tracking-wider uppercase hover:underline underline-offset-4"
        >
          VER CATALOGO
        </Link>
        <SignedIn>
          {isReservationsPage ? (
            <Link
              href="/"
              className="text-brand-teal text-sm font-bold tracking-wider uppercase hover:underline underline-offset-4"
            >
              REGRESAR A PAGINA PRINCIPAL
            </Link>
          ) : (
            <Link
              href="/reservas"
              className="text-white text-sm font-medium tracking-wider uppercase hover:underline underline-offset-4"
            >
              MIS RESERVAS
            </Link>
          )}
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="text-white hover:text-brand-teal transition-colors hover:cursor-pointer">
              <span className="sr-only">Sign In</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </button>
          </SignInButton>
        </SignedOut>
      </div>

      {/* Mobile Navigation - Only User Button if signed in, otherwise relying on Hero buttons */}
      <div className="md:hidden flex items-center gap-4">
        <SignedIn>
          {isReservationsPage && (
            <Link
              href="/"
              className="text-brand-teal text-xs font-bold tracking-wider uppercase hover:underline underline-offset-4 mr-2"
            >
              REGRESAR
            </Link>
          )}
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="text-white hover:text-brand-teal transition-colors hover:cursor-pointer">
              <span className="sr-only">Sign In</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </header>
  );
}