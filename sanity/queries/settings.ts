import { defineQuery } from "next-sanity";

export const SETTINGS_QUERY = defineQuery(`
    *[_type == "settings"][0]{
        ...,
        "heroImageUrl": heroImage.asset->url,
        productSelectionTitle,
        productSelectionDescription
    }
`);
