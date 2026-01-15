"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductSelection } from "@/components/ProductSelection";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Booking } from "@/components/Booking";
import { Location, Settings } from "@/lib/data";
import { ExtraItem } from "@/components/ExtrasSelector";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";

interface HomeClientProps {
  products: Location[];
  extras: ExtraItem[];
  settings: Settings | null;
}

export function HomeClient({ products, extras, settings }: HomeClientProps) {
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
    <div className="flex min-h-screen flex-col font-sans bg-gray-50 selection:bg-brand-teal/20">
      <Header isChatEnabled={settings?.isChatEnabled ?? true} />
      <main className="flex-1">
        <Hero
          title={settings?.heroTitle}
          description={settings?.heroDescription}
          imageUrl={settings?.heroImageUrl}
        />
        <Features features={settings?.features} />
        <section className="pb-16 px-4 md:px-12 max-w-6xl mx-auto">
          <ProductSelection
            selectedLocationId={selectedLocationId}
            onSelectLocation={setSelectedLocationId}
            products={products}
            title={settings?.productSelectionTitle}
            description={settings?.productSelectionDescription}
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
