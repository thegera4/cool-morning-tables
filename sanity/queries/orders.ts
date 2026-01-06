import { defineQuery } from "next-sanity";

export const ORDERS_QUERY = defineQuery(`
  *[_type == "order" && (clerkUserId == $userId || email == $userEmail)] | order(reservationDate desc) {
    _id,
    orderNumber,
    reservationDate,
    source,
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
        name,
        slug,
        images,
        _type
      }
    }
  }
`);
