import { Suspense } from "react";
import { HomeClient } from "@/components/HomeClient";
import { ExtraItem } from "@/components/ExtrasSelector";
import { sanityFetch } from "@/sanity/lib/live";
import { PRODUCTS_QUERY } from "@/sanity/queries/products";
import { ALL_EXTRAS_QUERY } from "@/sanity/queries/extras";
import { SETTINGS_QUERY } from "@/sanity/queries/settings";
import { Location } from "@/lib/data";


export default async function Home() {
  const [productsResult, extrasResult, settingsResult] = await Promise.all([
    sanityFetch({ query: PRODUCTS_QUERY }),
    sanityFetch({ query: ALL_EXTRAS_QUERY }),
    sanityFetch({ query: SETTINGS_QUERY }),
  ]);

  return (
    <Suspense>
      <HomeClient
        products={productsResult.data as Location[]}
        extras={extrasResult.data as ExtraItem[]}
        settings={settingsResult.data}
      />
    </Suspense>
  );
}