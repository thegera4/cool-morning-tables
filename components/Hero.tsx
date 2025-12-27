import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";

/** Hero section includes a background image, a heading, a subheading, and two buttons */
export function Hero() {
  return (
    <section className="relative h-[600px] w-full overflow-hidden">
      <Image
        src="/hero-bg.png"
        alt="Romantic Dinner"
        fill
        className="object-cover object-center"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/40" /> {/* Overlay for text readability */}
      <div className="relative z-10 container mx-auto px-6 md:px-12 h-full flex flex-col justify-center text-white">
        <div className="max-w-xl mt-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Experiencias Unicas</h1>
          <p className="text-sm md:text-base text-gray-200 mb-8 max-w-md leading-relaxed">
            Cool Morning es tu aliado perfecto para esas ocasiones especiales con tus seres queridos.
          </p>
          <div className="flex flex-wrap gap-4">
            {/* This button is only visible to users that are not signed in */}
            <SignedOut>
              <SignInButton mode="modal">
                <Button className="bg-teal-500 hover:bg-teal-600 text-white rounded-full px-8 h-10 text-xs font-bold tracking-wide uppercase shadow-lg shadow-teal-500/20">
                  Inicia Sesion
                </Button>
              </SignInButton>
            </SignedOut>
            {/* This button is only visible to users that are signed in */}
            <SignedIn>
              <Button
                asChild
                className="bg-teal-500 hover:bg-teal-600 text-white rounded-full px-8 h-10 text-xs font-bold tracking-wide uppercase shadow-lg shadow-teal-500/20"
              >
                <Link href="/reservas">Ver Reservas</Link>
              </Button>
            </SignedIn>
            {/* This button is always visible */}
            <Button
              variant="outline"
              asChild
              className="bg-transparent hover:bg-white/10 text-white hover:text-whiteborder-white/40 hover:border-white rounded-full px-8 h-10 text-xs font-bold tracking-wide uppercase backdrop-blur-sm cursor-pointer"
            >
              <Link href="/catalogo">Ver Catalogo</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}