import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHeader } from "@/components/site/SiteShell";
import { ShopView } from "@/components/site/ShopView";
import { getProductsFn } from "@/lib/catalog-server";

export const Route = createFileRoute("/macetas")({
  loader: () => getProductsFn(),
  head: () => ({
    meta: [
      { title: "Macetas de cerámica y terracota · ViveroFlor" },
      {
        name: "description",
        content: "Macetas de diseño en tonos naturales, con drenaje, para interior y exterior.",
      },
      { property: "og:title", content: "Macetas · ViveroFlor" },
      { property: "og:description", content: "Cerámica, terracota y diseño en tonos naturales." },
    ],
  }),
  component: Macetas,
});

function Macetas() {
  const allProducts = Route.useLoaderData();
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Diseño"
        title="Macetas"
        subtitle="Cerámica esmaltada, terracota natural y sets para combinar."
      />
      <ShopView fixedCategory="macetas" source={allProducts} />
    </SiteShell>
  );
}
