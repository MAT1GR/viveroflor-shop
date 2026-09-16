import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { SiteShell, PageHeader } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import {
  canDeliver,
  formatPrice,
  missingForDelivery,
  shippingCostFor,
  storeConfig,
} from "@/lib/store-config";

export const Route = createFileRoute("/carrito")({
  head: () => ({
    meta: [
      { title: "Tu carrito · ViveroFlor" },
      {
        name: "description",
        content: "Revisá tus plantas, macetas y accesorios antes de finalizar la compra.",
      },
      { property: "og:title", content: "Tu carrito · ViveroFlor" },
      {
        property: "og:description",
        content: "Revisá tu pedido y elegí envío en Rosario o retiro por el local.",
      },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, setQuantity, remove, count } = useCart();
  const shipping = shippingCostFor(subtotal, "delivery");
  const deliveryAvailable = canDeliver(subtotal);
  const falta = missingForDelivery(subtotal);

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Paso 1 de 3"
        title="Tu carrito"
        subtitle={
          count > 0
            ? `${count} producto${count === 1 ? "" : "s"} listos para el siguiente paso.`
            : undefined
        }
      />

      <div className="container-page py-10">
        {items.length === 0 ? (
          <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-secondary">
              <ShoppingBag className="size-6 text-primary" />
            </span>
            <h2 className="mt-4 font-display text-xl font-semibold">Tu carrito está vacío</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sumá plantas, macetas o accesorios y volvé para finalizar tu pedido.
            </p>
            <Button asChild size="lg" className="mt-5">
              <Link to="/tienda">Ir a la tienda</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft"
                >
                  <Link to="/producto/$slug" params={{ slug: item.slug }} className="shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      className="size-24 rounded-xl object-cover md:size-28"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        to="/producto/$slug"
                        params={{ slug: item.slug }}
                        className="font-medium hover:text-primary"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => remove(item.productId)}
                        aria-label={`Eliminar ${item.name}`}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatPrice(item.price)} por unidad
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-border">
                        <button
                          className="flex size-10 items-center justify-center rounded-full hover:bg-secondary"
                          aria-label="Restar unidad"
                          onClick={() => setQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="size-4" />
                        </button>
                        <span className="w-9 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          className="flex size-10 items-center justify-center rounded-full hover:bg-secondary disabled:opacity-40"
                          aria-label="Sumar unidad"
                          disabled={item.quantity >= item.stock}
                          onClick={() => setQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>
                      <span className="font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="h-fit rounded-2xl border border-border bg-cream p-5 shadow-soft lg:sticky lg:top-24">
              <h2 className="font-display text-lg font-semibold">Resumen</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envío en Rosario</span>
                  <span className="font-medium">
                    {deliveryAvailable
                      ? formatPrice(shipping)
                      : `Desde ${formatPrice(storeConfig.shipping.minOrderForDelivery)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Retiro por el local</span>
                  <span className="font-medium">Gratis</span>
                </div>
              </div>
              {falta > 0 && (
                <p className="mt-3 rounded-xl bg-secondary p-3 text-xs text-foreground">
                  Te faltan {formatPrice(falta)} para llegar a la compra mínima de envío. Podés
                  retirar por el local sin costo.
                </p>
              )}
              <div className="mt-4 flex justify-between border-t border-border pt-3 text-base font-semibold">
                <span>Total estimado</span>
                <span>{formatPrice(subtotal + shipping)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                El costo final de envío se define en el checkout según el método de entrega.
              </p>
              <Button asChild size="lg" className="mt-4 w-full">
                <Link to="/checkout">
                  Continuar al checkout <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="mt-2 w-full">
                <Link to="/tienda">Seguir comprando</Link>
              </Button>
            </aside>
          </div>
        )}
      </div>
    </SiteShell>
  );
}
