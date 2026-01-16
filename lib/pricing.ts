import { client } from "@/sanity/lib/client";
import { PRODUCTS_QUERY } from "@/sanity/queries/products";
import { ALL_EXTRAS_QUERY } from "@/sanity/queries/extras";
import { Location, Extra } from "@/lib/data";

export async function calculateOrderTotal(
  locationId: string,
  extras: Record<string, number>,
  payDeposit: boolean
): Promise<number> {
  // Fetch latest data from Sanity to ensure authentic prices
  // We fetch all because the dataset is small, but in a larger app we would filter by ID in GROQ
  const [products, extraItems] = await Promise.all([
    client.fetch<Location[]>(PRODUCTS_QUERY),
    client.fetch<Extra[]>(ALL_EXTRAS_QUERY),
  ]);

  // Find the selected location
  // Note: PRODUCTS_QUERY maps slug.current to "id"
  // Products query uses "id" for slug.current
  // We need to match locationId which is likely the slug or the id field
  const location = products.find((p) => p.id === locationId);

  if (!location) {
    throw new Error(`Invalid location ID: ${locationId}`);
  }

  const locationPrice = location.price || 0;

  // Calculate total for extras
  let extrasTotal = 0;
  for (const [id, quantity] of Object.entries(extras)) {
    if (quantity > 0) {
      const extra = extraItems.find((e) => e.id === id || e._id === id); // Handle both id and _id just in case
      if (extra && extra.price) {
        extrasTotal += extra.price * quantity;
      }
    }
  }

  const total = locationPrice + extrasTotal;

  // Apply deposit logic
  return payDeposit ? total / 2 : total;
}
