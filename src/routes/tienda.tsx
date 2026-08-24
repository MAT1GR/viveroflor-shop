import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHeader } from "@/components/site/SiteShell";
import { ShopView } from "@/components/site/ShopView";

type Search = { q?: string };

export const Route = createFileRoute("/tienda")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    q: typeof search.q === "string" && search.q ? search.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Tienda · ViveroFlor" },
      {
        name: "description",
        content: "Catálogo completo de plantas, macetas y accesorios con filtros por precio y stock.",
      },
      { property: "og:title", content: "Tienda · ViveroFlor" },
      { property: "og:description", content: "Plantas, macetas y accesorios en Rosario." },
    ],
  }),
  component: Tienda,
});

function Tienda() {
  const { q } = Route.useSearch();
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Catálogo"
        title="Tienda"
        subtitle="Filtrá por categoría, precio y disponibilidad para encontrar tu próxima planta."
      />
      <ShopView key={q ?? ""} initialQuery={q ?? ""} />
    </SiteShell>
  );
}
