import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://cool-morning-tables.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/studio/", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
