"use client";

import Link from "next/link";
import Image from "next/image";
import { SignedIn } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

export function Footer() {
    const pathname = usePathname();
    const isReservationsPage = pathname === "/reservas";

    return (
        <footer className="w-full bg-brand-teal text-white py-8 px-6 md:px-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex flex-col items-center md:items-start">
                    <Link href="/" className="relative h-10 w-40">
                        <Image
                            src="/Logo.png"
                            alt="Cool Morning Logo"
                            fill
                            className="object-contain object-center md:object-left"
                            sizes="160px"
                        />
                    </Link>
                    <p className="text-[10px] mt-1 text-white/80">
                        © Copyright Cool Morning.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-8">
                    <a href="/catalogo-2026.pdf" target="_blank" rel="noopener noreferrer" className="text-xs font-bold tracking-widest text-white/80 hover:text-white transition-colors">
                        VER CATALOGO
                    </a>
                    <SignedIn>
                        {isReservationsPage ? (
                            <Link href="/" className="text-xs font-bold tracking-widest text-white/80 hover:text-white transition-colors">
                                REGRESAR A PAGINA PRINCIPAL
                            </Link>
                        ) : (
                            <Link href="/reservas" className="text-xs font-bold tracking-widest text-white/80 hover:text-white transition-colors">
                                MIS RESERVAS
                            </Link>
                        )}
                    </SignedIn>

                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold tracking-widest text-white/80">CONTACTO:</span>
                        <div className="flex items-center gap-4">
                            <Link href="https://wa.me/528711390732" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-white/80">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
                                    <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" />
                                </svg>
                            </Link>
                            <Link href="https://www.facebook.com/CoolMorningLaguna/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-white/80">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3" />
                                </svg>
                            </Link>
                            <Link href="https://www.instagram.com/coolmorning/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-white/80">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4m0 4a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z" />
                                    <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                                    <path d="M16.5 7.5l0 .01" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    <Link href="https://coolmorning.com.mx/" target="_blank" rel="noopener noreferrer" className="text-xs font-bold tracking-widest text-white/80 hover:text-white transition-colors">COOLMORNING.COM.MX</Link>
                </div>
            </div>
        </footer>
    );
}