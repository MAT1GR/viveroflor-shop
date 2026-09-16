import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHeader } from "@/components/site/SiteShell";
import { ShopView } from "@/components/site/ShopView";
import { getProductsFn } from "@/lib/catalog-server";

export const Route = createFileRoute("/plantas")({
  loader: () => getProductsFn(),
  head: () => ({
    meta: [
      { title: "Plantas de interior y exterior · ViveroFlor" },
      {
        name: "description",
        content:
          "Monstera, ficus, potus, suculentas y más. Plantas sanas listas para tu casa en Rosario.",
      },
      { property: "og:title", content: "Plantas · ViveroFlor" },
      {
        property: "og:description",
        content: "Plantas de interior y exterior seleccionadas una por una.",
      },
    ],
  }),
  component: Plantas,
});

function Plantas() {
  const allProducts = Route.useLoaderData();
  const source = allProducts.filter(
    (p) => p.active && ["plantas", "interior", "exterior"].includes(p.category_id),
  );
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Verde"
        title="Plantas"
        subtitle="De interior y exterior, con recomendaciones de cuidado en cada ficha."
      />
      <ShopView source={source} />
    </SiteShell>
  );
}
