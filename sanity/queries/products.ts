import { defineQuery } from "next-sanity";

export const PRODUCTS_QUERY = defineQuery(`
  *[_type == "product"] {
    _id,
    "id": slug.current,
    name,
    price,
    description,
    "imageUrl": images[0].asset->url,
    blockedDates
  }
`);
