"use client";

import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Heart, AtSign, Phone, CheckCircle2 } from "lucide-react";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { useState, useRef, useEffect } from "react";
import { LocationGrid } from "@/components/LocationGrid";
import { BookingCalendar } from "@/components/BookingCalendar";
import { ExtrasSelector } from "@/components/ExtrasSelector";
import { ContactForm, ContactInfo } from "@/components/ContactForm";
import { PaymentForm, PaymentInfo } from "@/components/PaymentForm";
import { OrderSummary } from "@/components/OrderSummary";

export default function Home() {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string | undefined>(undefined);
  const [extras, setExtras] = useState<Record<string, number>>({});
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardName: "",
    cardNumber: "",
    expMonth: "",
    expYear: "",
    cvv: "",
  });

  const bookingSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedLocationId && bookingSectionRef.current) {
      // slight delay to ensure the element is fully rendered and layout is computed
      setTimeout(() => {
        bookingSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [selectedLocationId]);

  const handleUpdateExtra = (id: string, count: number) => {
    setExtras((prev) => {
      const newExtras = { ...prev };
      if (count === 0) {
        delete newExtras[id];
      } else {
        newExtras[id] = count;
      }
      return newExtras;
    });
  };

  return (
    <div className="flex min-h-screen flex-col font-sans bg-gray-50 selection:bg-teal-100">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
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
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button className="bg-teal-500 hover:bg-teal-600 text-white rounded-full px-8 h-10 text-xs font-bold tracking-wide uppercase shadow-lg shadow-teal-500/20">
                      Inicia Sesion
                    </Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Button
                    asChild
                    className="bg-teal-500 hover:bg-teal-600 text-white rounded-full px-8 h-10 text-xs font-bold tracking-wide uppercase shadow-lg shadow-teal-500/20"
                  >
                    <Link href="/reservas">Ver Reservas</Link>
                  </Button>
                </SignedIn>
                <Button
                  variant="outline"
                  asChild
                  className="bg-transparent hover:bg-white/10 text-white hover:text-white border-white/40 hover:border-white rounded-full px-8 h-10 text-xs font-bold tracking-wide uppercase backdrop-blur-sm cursor-pointer"
                >
                  <Link href="/catalogo">Ver Catalogo</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        {/* Features Section */}
        <section className="py-16 px-6 md:px-12 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {/* Feature 1 */}
            <div className="flex flex-col items-center">
              <div className="mb-4 text-amber-700"><Heart className="h-10 w-10 stroke-[1.5]" /></div>
              <h3 className="text-teal-500 font-bold mb-2">Personalizado</h3>
              <p className="text-xs text-gray-800 font-medium leading-relaxed max-w-xs">
                Revisa nuestro catalogo y complementa tu renta para hacerlo unico y especial.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="flex flex-col items-center">
              <div className="mb-4 text-amber-700"><AtSign className="h-10 w-10 stroke-[1.5]" /></div>
              <h3 className="text-teal-500 font-bold mb-2">En linea</h3>
              <p className="text-xs text-gray-800 font-medium leading-relaxed max-w-xs">
                Nuestro sistema de reservas en linea esta disponible 24/7 para ti.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="flex flex-col items-center">
              <div className="mb-4 text-amber-700"><Phone className="h-10 w-10 stroke-[1.5]" /></div>
              <h3 className="text-teal-500 font-bold mb-2">¿Dudas?</h3>
              <p className="text-xs text-gray-800 font-medium leading-relaxed max-w-xs">
                Si tienes alguna duda o problema, contactanos, estamos para ti.
              </p>
            </div>
          </div>
          <div className="mt-16 mb-8 flex items-center gap-3">
            <h3 className="text-teal-500 font-bold text-lg">Selecciona tu lugar:</h3>
          </div>
          <LocationGrid selectedLocationId={selectedLocationId} onSelectLocation={setSelectedLocationId} />
          {selectedLocationId && (
            <div
              ref={bookingSectionRef}
              className="mt-12 animate-in fade-in slide-in-from-bottom-10 duration-700 fill-mode-both scroll-mt-24"
            >

              <SignedOut>
                <div className="flex flex-col items-center justify-center py-12 text-center bg-white/50 backdrop-blur-sm rounded-xl border border-white/60 shadow-lg">
                  <h3 className="text-2xl font-bold text-teal-600 mb-4">¡Casi listo para reservar!</h3>
                  <p className="text-gray-600 mb-8 max-w-md">
                    Para continuar con tu reserva y ver los detalles, por favor inicia sesion o registrate.
                  </p>
                  <SignInButton mode="modal">
                    <Button className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
                      Inicia Sesion o Registrate para empezar a Rentar!
                    </Button>
                  </SignInButton>
                </div>
              </SignedOut>

              <SignedIn>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                  {/* Left Column: Form Steps */}
                  <div className="lg:col-span-7 flex flex-col gap-8">
                    <BookingCalendar
                      date={date}
                      setDate={setDate}
                      time={time}
                      setTime={setTime}
                    />

                    <ContactForm
                      contactInfo={contactInfo}
                      setContactInfo={setContactInfo}
                    />

                    <PaymentForm
                      paymentInfo={paymentInfo}
                      setPaymentInfo={setPaymentInfo}
                    />
                  </div>

                  {/* Right Column: Extras and Summary */}
                  <div className="lg:col-span-5 flex flex-col gap-8 sticky top-8">
                    <ExtrasSelector
                      selectedExtras={extras}
                      onUpdateExtra={handleUpdateExtra}
                    />

                    <OrderSummary
                      locationId={selectedLocationId}
                      date={date}
                      time={time}
                      extras={extras}
                      contactInfo={contactInfo}
                    />
                  </div>
                </div>
              </SignedIn>

            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}