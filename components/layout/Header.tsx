"use client";

import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const isReservationsPage = pathname === "/reservas";

  return (
    <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12">
      <div className="flex items-center">
        <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-brand-teal">
          Cool Morning
        </Link>
      </div>
      <div className="flex items-center gap-6">
        <SignedIn>
          {isReservationsPage ? (
            <Link
              href="/"
              className="text-brand-teal text-xs md:text-sm font-bold tracking-wider uppercase hover:underline underline-offset-4"
            >
              REGRESAR A PAGINA PRINCIPAL
            </Link>
          ) : (
            <Link
              href="/reservas"
              className="text-white text-xs md:text-sm font-medium tracking-wider uppercase hover:underline underline-offset-4"
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
    </header>
  );
}