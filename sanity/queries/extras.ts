import { defineQuery } from "next-sanity";

export const ALL_EXTRAS_QUERY = defineQuery(`
  *[_type == "extra"] | order(price asc) {
    _id,
    name,
    price,
    description,
    allowQuantity
  }
`);
