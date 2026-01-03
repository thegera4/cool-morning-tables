import { sanityFetch } from "@/sanity/lib/live";
import { HomeClient } from "@/components/HomeClient";
import { ALL_EXTRAS_QUERY } from "@/sanity/queries/extras";
import { Location } from "@/lib/data";
import { ExtraItem } from "@/components/ExtrasSelector";

const PRODUCTS_QUERY = `*[_type == "product"]{
  "id": slug.current,
  name,
  price,
  description,
  "imageUrl": images[0].asset->url
}`;

export default async function Home() {
  const [productsResult, extrasResult] = await Promise.all([
    sanityFetch({ query: PRODUCTS_QUERY }),
    sanityFetch({ query: ALL_EXTRAS_QUERY }),
  ]);

  return (
    <HomeClient
      products={productsResult.data as Location[]}
      extras={extrasResult.data as ExtraItem[]}
    />
  );
}