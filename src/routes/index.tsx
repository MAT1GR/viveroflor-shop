import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Leaf, Truck, ShieldCheck, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteShell } from "@/components/site/SiteShell";
import { ProductCard } from "@/components/site/ProductCard";
import { categories, products } from "@/lib/catalog";
import { formatPrice, storeConfig } from "@/lib/store-config";
import heroImage from "@/assets/cat-interior.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ViveroFlor · Plantas y macetas en Rosario" },
      {
        name: "description",
        content:
          "Comprá plantas de interior y exterior, macetas de diseño y accesorios. Envío en Rosario o retiro por el local.",
      },
      { property: "og:title", content: "ViveroFlor · Plantas y macetas en Rosario" },
      {
        property: "og:description",
        content: "Tienda online del vivero: plantas, macetas y accesorios con envío en Rosario.",
      },
    ],
  }),
  component: Index,
});

const benefits = [
  { icon: Truck, title: "Envío en Rosario", text: `Gratis desde ${formatPrice(storeConfig.shipping.freeFrom)}` },
  { icon: Store, title: "Retiro por el local", text: storeConfig.address },
  { icon: ShieldCheck, title: "Pago seguro", text: "Mercado Pago o transferencia" },
  { icon: Leaf, title: "Plantas sanas", text: "Seleccionadas una por una" },
];

function Index() {
  const featured = products.filter((p) => p.featured && p.active).slice(0, 4);
  const offers = products.filter((p) => p.compare_price && p.compare_price > p.price).slice(0, 3);

  return (
    <SiteShell>
      <section className="relative overflow-hidden border-b border-border bg-cream">
        <div className="container-page grid items-center gap-10 py-14 md:py-20 lg:grid-cols-2">
          <div className="animate-fade-up">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Vivero en Rosario · Santa Fe
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] md:text-6xl">
              Plantas que hacen<br />sentir tu casa
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              {storeConfig.tagline} Elegí online, te lo llevamos a tu puerta o lo retirás por el
              local.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/tienda">
                  Ver tienda <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/plantas">Explorar plantas</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <img
              src={heroImage}
              alt="Plantas de interior en macetas de cerámica"
              width={1200}
              height={1200}
              className="aspect-[4/3] w-full rounded-3xl object-cover shadow-lift"
            />
            <div className="absolute -bottom-5 left-5 rounded-2xl border border-border bg-card px-5 py-3 shadow-lift">
              <p className="text-xs text-muted-foreground">Envío gratis desde</p>
              <p className="font-display text-xl font-semibold">
                {formatPrice(storeConfig.shipping.freeFrom)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background">
        <div className="container-page grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <div key={b.title} className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                <b.icon className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">{b.title}</p>
                <p className="text-sm text-muted-foreground">{b.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold md:text-3xl">Categorías</h2>
            <p className="mt-2 text-muted-foreground">Encontrá lo que buscás más rápido.</p>
          </div>
          <Link to="/categorias" className="text-sm font-medium text-primary hover:underline">
            Ver todas
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/tienda"
              search={{ q: undefined }}
              className="group relative overflow-hidden rounded-2xl border border-border shadow-soft transition-transform hover:-translate-y-1"
            >
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent p-4">
                <p className="font-display text-lg font-semibold text-background">
                  {c.emoji} {c.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-cream py-14">
        <div className="container-page">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-semibold md:text-3xl">Destacados</h2>
              <p className="mt-2 text-muted-foreground">Los favoritos de nuestros clientes.</p>
            </div>
            <Link to="/tienda" className="text-sm font-medium text-primary hover:underline">
              Ver todo
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {offers.length > 0 && (
        <section className="container-page py-14">
          <h2 className="font-display text-2xl font-semibold md:text-3xl">Ofertas de la semana</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="container-page pb-16">
        <div className="rounded-3xl bg-primary px-8 py-12 text-primary-foreground md:px-14">
          <h2 className="font-display text-2xl font-semibold md:text-3xl">
            ¿No sabés cuál elegir?
          </h2>
          <p className="mt-3 max-w-xl text-primary-foreground/80">
            Contanos cómo es tu espacio y te recomendamos las plantas que mejor se adaptan.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-7">
            <Link to="/contacto">Escribinos</Link>
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
