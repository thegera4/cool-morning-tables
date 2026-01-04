"use server";

import { client } from "@/sanity/lib/client";
import { currentUser } from "@clerk/nextjs/server";

export async function getOrders() {
  const user = await currentUser();

  if (!user) {
    // This server action might be called from components, so keeping a check is good safety,
    // but the page now redirects before calling this.
    // We can return empty list or throw, but throw causes the error overlay if not caught.
    // Let's just return empty array if no user, to be safe.
    return [];
  }

  // Fetch orders where clerkUserId matches the current user's ID
  // Sort by reservationDate descending (newest first)
  const query = `*[_type == "order" && clerkUserId == $userId] | order(reservationDate desc) {
    _id,
    orderNumber,
    reservationDate,
    status,
    total,
    amountPaid,
    amountPending,
    items[] {
      _key,
      quantity,
      priceAtPurchase,
      product->{
        name,
        slug,
        images
      }
    }
  }`;

  const orders = await client.fetch(query, { userId: user.id });

  return orders;
}
