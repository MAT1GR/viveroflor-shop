import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell, PageHeader } from "@/components/site/SiteShell";
import { categories, products } from "@/lib/catalog";

export const Route = createFileRoute("/categorias")({
  head: () => ({
    meta: [
      { title: "Categorías · ViveroFlor" },
      {
        name: "description",
        content: "Recorré las categorías del vivero: plantas, macetas, interior, exterior y accesorios.",
      },
      { property: "og:title", content: "Categorías · ViveroFlor" },
      { property: "og:description", content: "Plantas, macetas, interior, exterior y accesorios." },
    ],
  }),
  component: Categorias,
});

function Categorias() {
  return (
    <SiteShell>
      <PageHeader eyebrow="Explorar" title="Categorías" subtitle="Elegí por dónde empezar." />
      <div className="container-page grid gap-6 py-12 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => {
          const count = products.filter((p) => p.active && p.category_id === c.id).length;
          return (
            <Link
              key={c.id}
              to="/tienda"
              search={{ q: undefined }}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-transform hover:-translate-y-1"
            >
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="p-5">
                <p className="font-display text-lg font-semibold">
                  {c.emoji} {c.name}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-primary">
                  {count} productos
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </SiteShell>
  );
}
