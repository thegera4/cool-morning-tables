"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useState } from "react";
import { ProductSelection } from "@/components/ProductSelection";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Booking } from "@/components/Booking";

export default function Home() {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen flex-col font-sans bg-gray-50 selection:bg-teal-100">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <section className="pb-16 px-6 md:px-12 max-w-6xl mx-auto">
          <ProductSelection selectedLocationId={selectedLocationId} onSelectLocation={setSelectedLocationId} />
          {selectedLocationId && (<Booking selectedLocationId={selectedLocationId} />)}
        </section>
      </main>
      <Footer />
    </div>
  );
}