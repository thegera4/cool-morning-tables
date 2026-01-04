"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductSelection } from "@/components/ProductSelection";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Booking } from "@/components/Booking";
import { Location } from "@/lib/data";
import { ExtraItem } from "@/components/ExtrasSelector";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";

interface HomeClientProps {
  products: Location[];
  extras: ExtraItem[];
}

export function HomeClient({ products, extras }: HomeClientProps) {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("error") === "login_required") {
      toast.error("Acceso restringido", {
        description: "Debes iniciar sesión para ver tus reservas.",
        duration: 5000,
      });
      // Clear the query param so toast doesn't show again on refresh
      router.replace("/", { scroll: false });
    }
  }, [searchParams, router]);

  const selectedLocation = products.find((p) => p.id === selectedLocationId);

  return (
    <div className="flex min-h-screen flex-col font-sans bg-gray-50 selection:bg-teal-100">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <section className="pb-16 px-6 md:px-12 max-w-6xl mx-auto">
          <ProductSelection
            selectedLocationId={selectedLocationId}
            onSelectLocation={setSelectedLocationId}
            products={products}
          />
          {selectedLocationId && selectedLocation && (
            <Booking
              selectedLocationId={selectedLocationId}
              location={selectedLocation}
              extrasData={extras}
            />
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
