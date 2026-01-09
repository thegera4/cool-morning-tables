export default function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Cool Morning Cenas",
    image: "https://cool-morning-tables.vercel.app/Logo.png",
    description: "Experiencia Cool Morning en columpios con cena incluida.",
    url: "https://cool-morning-tables.vercel.app/",
    telephone: "8711390732",
    priceRange: "$1990 - $10000 mxn",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Torreon",
      addressCountry: "MX",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 25.526708153188107,
      longitude: -103.40352145767211,
    },
    servesCuisine: "Cena Romántica",
  };

  const breadcrumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: "https://cool-morning-tables.vercel.app/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Mis Reservas",
        item: "https://cool-morning-tables.vercel.app/reservas",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsLd) }}
      />
    </>
  );
}
