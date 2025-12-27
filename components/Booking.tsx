"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { BookingCalendar } from "@/components/BookingCalendar";
import { ContactForm, ContactInfo } from "@/components/ContactForm";
import { PaymentForm, PaymentInfo } from "@/components/PaymentForm";
import { ExtrasSelector } from "@/components/ExtrasSelector";
import { OrderSummary } from "@/components/OrderSummary";

interface BookingProps {
  selectedLocationId: string;
}

export function Booking({ selectedLocationId }: BookingProps) {
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

  // Auto-scroll to booking section when mounted (which happens when location is selected)
  useEffect(() => {
    if (bookingSectionRef.current) {
      setTimeout(() => { bookingSectionRef.current?.scrollIntoView({behavior: "smooth", block: "start"});
      }, 150);
    }
  }, [selectedLocationId]);

  /** Updates extras count when a product is selected */
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
              Inicia Sesion o Registrate para poder reservar.
            </Button>
          </SignInButton>
        </div>
      </SignedOut>
      <SignedIn>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Steps */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <BookingCalendar date={date} setDate={setDate} time={time} setTime={setTime} />
            <ContactForm contactInfo={contactInfo} setContactInfo={setContactInfo} />
            <PaymentForm paymentInfo={paymentInfo} setPaymentInfo={setPaymentInfo} />
          </div>
          {/* Right Column: Extras and Summary */}
          <div className="lg:col-span-5 flex flex-col gap-8 sticky top-8">
            <ExtrasSelector selectedExtras={extras} onUpdateExtra={handleUpdateExtra} />
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
  );
}