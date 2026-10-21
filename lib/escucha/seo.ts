import { absoluteUrl, SITE_URL } from "@/app/seo";

/* JSON-LD de las herramientas gratis: la página, la aplicación (gratis, en el
 * navegador), sus preguntas frecuentes y la miga de pan Shift LAB > herramienta.
 * Con esto Google y los motores de IA entienden que la URL es una herramienta
 * que se usa, no solo un texto. */

type Faq = readonly (readonly string[])[] | readonly { p: string; r: string }[];

export function schemaHerramienta(o: { ruta: string; titulo: string; descripcion: string; nombreApp: string; faq: Faq; funciones: string[] }) {
  const url = absoluteUrl(o.ruta);
  const preguntas = (o.faq as readonly unknown[]).map((x) => (Array.isArray(x) ? { p: x[0] as string, r: x[1] as string } : (x as { p: string; r: string })));
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${url}#pagina`, url, name: o.titulo, description: o.descripcion, inLanguage: "es", isPartOf: { "@type": "WebSite", name: "Shift LATAM", url: SITE_URL }, mainEntity: { "@id": `${url}#app` } },
      {
        "@type": "WebApplication",
        "@id": `${url}#app`,
        name: o.nombreApp,
        url,
        description: o.descripcion,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        inLanguage: "es",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        featureList: o.funciones,
        provider: { "@type": "Organization", name: "Shift LATAM", url: SITE_URL },
        potentialAction: { "@type": "UseAction", target: { "@type": "EntryPoint", urlTemplate: `${url}?marca={marca}&pais={pais}` } },
      },
      { "@type": "FAQPage", "@id": `${url}#faq`, mainEntity: preguntas.map((q) => ({ "@type": "Question", name: q.p, acceptedAnswer: { "@type": "Answer", text: q.r } })) },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Shift LAB", item: absoluteUrl("/shift-lab") },
          { "@type": "ListItem", position: 2, name: o.nombreApp, item: url },
        ],
      },
    ],
  };
}
