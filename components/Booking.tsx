"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { SignInButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { BookingCalendar } from "@/components/BookingCalendar";
import { ContactForm, ContactInfo } from "@/components/ContactForm";
import { PaymentForm } from "@/components/PaymentForm";
import { ExtrasSelector } from "@/components/ExtrasSelector";
import { OrderSummary } from "@/components/OrderSummary";
import { StripeWrapper } from "@/components/StripeWrapper";
import { client } from "@/sanity/lib/client";
import { Location } from "@/lib/data";
import { ExtraItem } from "@/components/ExtrasSelector";

interface BookingProps {
  selectedLocationId: string;
  location: Location;
  extrasData: ExtraItem[];
}

export function Booking({ selectedLocationId, location, extrasData }: BookingProps) {
  const { user } = useUser();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string | undefined>(undefined);
  const [selectedExtras, setSelectedExtras] = useState<Record<string, number>>({});
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // Stripe state
  const [clientSecret, setClientSecret] = useState<string>("");
  const [paymentIntentId, setPaymentIntentId] = useState<string>("");
  const [payDeposit, setPayDeposit] = useState(false);

  // Prefill contact info from Clerk user
  useEffect(() => {
    if (user) {
      setContactInfo((prev) => ({
        ...prev,
        firstName: prev.firstName || user.firstName || "",
        lastName: prev.lastName || user.lastName || "",
        email: prev.email || user.primaryEmailAddress?.emailAddress || "",
      }));
    }
  }, [user]);

  const bookingSectionRef = useRef<HTMLDivElement>(null);

  // Fetch blocked dates when selectedLocationId changes
  useEffect(() => {
    const fetchBlockedDates = async () => {
      if (!selectedLocationId) return;
      try {
        const query = `*[_type == "product" && slug.current == $slug][0].blockedDates`;
        const result = await client.fetch(query, { slug: selectedLocationId });

        if (result) {
          setBlockedDates(result.map((d: string) => {
            const [year, month, day] = d.split('-').map(Number);
            return new Date(year, month - 1, day);
          }));
        } else {
          setBlockedDates([]);
        }
      } catch (error) {
        console.error("Error fetching blocked dates:", error);
      }
    };
    fetchBlockedDates();
  }, [selectedLocationId]);

  // Auto-scroll to booking section when mounted (which happens when location is selected)
  useEffect(() => {
    if (bookingSectionRef.current) {
      setTimeout(() => {
        bookingSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [selectedLocationId]);

  /** Updates extras count when a product is selected */
  const handleUpdateExtra = (id: string, count: number) => {
    setSelectedExtras((prev) => {
      const newExtras = { ...prev };
      if (count === 0) {
        delete newExtras[id];
      } else {
        newExtras[id] = count;
      }
      return newExtras;
    });
  };

  // Calculate total amount
  const locationPrice = location?.price || 0;
  const extrasTotal = Object.entries(selectedExtras).reduce((total, [id, count]) => {
    const extra = extrasData.find((e) => e._id === id);
    if (!extra || !extra.price) return total;
    return total + (extra.price * count);
  }, 0);
  const total = locationPrice + extrasTotal;
  const amountToPay = payDeposit ? total / 2 : total;

  // Manage PaymentIntent
  const createOrUpdatePaymentIntent = useCallback(async () => {
    if (!user || amountToPay <= 0) return;

    try {
      if (!paymentIntentId) {
        const res = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: amountToPay }),
        });
        const data = await res.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
          setPaymentIntentId(data.paymentIntentId);
        }
      } else {
        await fetch("/api/update-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentIntentId, amount: amountToPay }),
        });
        // Client secret remains valid
      }
    } catch (error) {
      console.error("Error creating/updating payment intent:", error);
    }
  }, [amountToPay, paymentIntentId, user]);

  // Debounce payment intent updates
  useEffect(() => {
    const timer = setTimeout(() => {
      createOrUpdatePaymentIntent();
    }, 1000); // 1s debounce

    return () => clearTimeout(timer);
  }, [createOrUpdatePaymentIntent]);


  return (
    <div
      ref={bookingSectionRef}
      className="mt-12 animate-in fade-in slide-in-from-bottom-10 duration-700 fill-mode-both scroll-mt-24"
    >
      {/* If user is not signed in, show sign in message and button */}
      <SignedOut>
        <div className="flex flex-col items-center justify-center py-12 text-center bg-white/50 backdrop-blur-sm rounded-xl border border-white/60 shadow-lg">
          <h3 className="text-2xl font-bold text-teal-600 mb-4">¡Casi listo para reservar!</h3>
          <p className="text-gray-600 mb-8 max-w-md">
            Para continuar con tu reserva y ver los detalles, por favor inicia sesion o registrate.
          </p>
          <SignInButton mode="modal">
            <Button className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all hover:cursor-pointer">
              Inicia Sesion o Registrate para poder reservar.
            </Button>
          </SignInButton>
        </div>
      </SignedOut>
      {/* If user is signed in, show booking form */}
      <SignedIn>
        <StripeWrapper clientSecret={clientSecret}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form Steps */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              <BookingCalendar
                date={date}
                setDate={setDate}
                time={time}
                setTime={setTime}
                blockedDates={blockedDates}
              />
              <ContactForm contactInfo={contactInfo} setContactInfo={setContactInfo} />
              <PaymentForm />
            </div>
            {/* Right Column: Extras and Summary */}
            <div className="lg:col-span-5 flex flex-col gap-8 sticky top-8">
              <ExtrasSelector extras={extrasData} selectedExtras={selectedExtras} onUpdateExtra={handleUpdateExtra} />
              <OrderSummary
                locationId={selectedLocationId}
                location={location}
                date={date}
                time={time}
                extras={selectedExtras}
                extrasData={extrasData}
                contactInfo={contactInfo}
                onUpdateExtra={handleUpdateExtra}
                paymentIntentId={paymentIntentId}
                // Props for Deposit state
                // @ts-ignore - Adding dynamic props not yet defined in component interface if I forgot
                payDeposit={payDeposit}
                setPayDeposit={setPayDeposit}
              />
            </div>
          </div>
        </StripeWrapper>
      </SignedIn>
    </div>
  );
}