import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, Droplets, Minus, Plus, ShoppingBag, Sun, Truck, Store } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { categoryName, discountPercent, getProduct, relatedProducts } from "@/lib/catalog";
import { formatPrice, storeConfig, waLink } from "@/lib/store-config";

export const Route = createFileRoute("/producto/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Producto no encontrado · ViveroFlor" }, { name: "robots", content: "noindex" }] };
    }
    const { product } = loaderData;
    const title = `${product.name} · ViveroFlor`;
    const description = product.description.slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { add, openCart } = useCart();
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);
  const off = discountPercent(product);
  const outOfStock = product.stock <= 0;

  return (
    <SiteShell>
      <div className="container-page py-6">
        <nav className="text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Inicio
          </Link>
          <span className="px-1.5">/</span>
          <Link to="/tienda" className="hover:text-primary">
            Tienda
          </Link>
          <span className="px-1.5">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div>
            <div className="overflow-hidden rounded-3xl border border-border bg-beige/40">
              <img
                src={product.images[active]}
                alt={product.name}
                width={1000}
                height={1000}
                className="aspect-square w-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={img}
                    onClick={() => setActive(i)}
                    aria-label={`Ver imagen ${i + 1}`}
                    className={`overflow-hidden rounded-xl border-2 ${i === active ? "border-primary" : "border-border"}`}
                  >
                    <img src={img} alt="" className="size-20 object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {categoryName(product.category_id)}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">{product.name}</h1>

            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-semibold">{formatPrice(product.price)}</span>
              {product.compare_price && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.compare_price)}
                </span>
              )}
              {off > 0 && (
                <span className="rounded-full bg-sale px-2.5 py-1 text-xs font-semibold text-sale-foreground">
                  -{off}%
                </span>
              )}
            </div>

            <p className="mt-4 text-muted-foreground">{product.description}</p>
            <p className="mt-3 text-sm text-muted-foreground">{product.size}</p>

            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {product.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="size-4 text-primary" /> {f}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-full border border-border">
                <button
                  className="flex size-11 items-center justify-center rounded-full hover:bg-secondary"
                  aria-label="Restar unidad"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-10 text-center font-medium">{qty}</span>
                <button
                  className="flex size-11 items-center justify-center rounded-full hover:bg-secondary disabled:opacity-40"
                  aria-label="Sumar unidad"
                  disabled={qty >= product.stock}
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                {outOfStock ? "Sin stock por ahora" : `${product.stock} unidades disponibles`}
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="flex-1"
                disabled={outOfStock}
                onClick={() => {
                  add(product, qty);
                  openCart();
                }}
              >
                <ShoppingBag className="mr-2 size-5" /> Agregar al carrito
              </Button>
              <Button asChild size="lg" variant="outline" className="flex-1">
                <a href={waLink(`Hola! Quiero consultar por ${product.name}`)} target="_blank" rel="noreferrer">
                  Consultar por WhatsApp
                </a>
              </Button>
            </div>

            <div className="mt-6 space-y-3 rounded-2xl border border-border bg-cream p-4 text-sm">
              <p className="flex items-center gap-2">
                <Truck className="size-4 text-primary" /> Envío en Rosario{" "}
                {formatPrice(storeConfig.shipping.deliveryCost)} · gratis desde{" "}
                {formatPrice(storeConfig.shipping.freeFrom)}
              </p>
              <p className="flex items-center gap-2">
                <Store className="size-4 text-primary" /> Retiro sin costo en {storeConfig.address}
              </p>
              {product.care && (
                <p className="flex items-start gap-2">
                  <Droplets className="mt-0.5 size-4 text-primary" /> {product.care}
                </p>
              )}
              <p className="flex items-center gap-2">
                <Sun className="size-4 text-primary" /> Asesoramiento de cuidado incluido en cada compra.
              </p>
            </div>
          </div>
        </div>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold">También te puede gustar</h2>
          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {relatedProducts(product).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
