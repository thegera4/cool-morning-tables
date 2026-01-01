"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useState, useEffect } from "react";
import { ProductSelection } from "@/components/ProductSelection";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Booking } from "@/components/Booking";
import { client } from "@/sanity/lib/client";
import { ALL_EXTRAS_QUERY } from "@/sanity/queries/extras";
import { Location } from "@/lib/data";
import { ExtraItem } from "@/components/ExtrasSelector";

export default function Home() {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [products, setProducts] = useState<Location[]>([]);
  const [extras, setExtras] = useState<ExtraItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsQuery = `*[_type == "product"]{
          "id": slug.current,
          name,
          price,
          description,
          "imageUrl": images[0].asset->url
        }`;

        const [productsResult, extrasResult] = await Promise.all([
          client.fetch(productsQuery),
          client.fetch(ALL_EXTRAS_QUERY)
        ]);

        setProducts(productsResult as Location[]);
        setExtras(extrasResult as ExtraItem[]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

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