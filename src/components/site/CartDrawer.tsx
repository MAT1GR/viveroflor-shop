import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatPrice, shippingCostFor, storeConfig } from "@/lib/store-config";

export function CartDrawer() {
  const { isOpen, closeCart, items, subtotal, setQuantity, remove, count } = useCart();
  const shipping = shippingCostFor(subtotal, "delivery");

  return (
    <Sheet open={isOpen} onOpenChange={(v) => !v && closeCart()}>
      <SheetContent side="right" className="flex w-full max-w-md flex-col gap-0 p-0">
        <div className="border-b border-border px-5 py-4">
          <p className="font-display text-lg font-semibold">Tu carrito ({count})</p>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-secondary">
              <ShoppingBag className="size-6 text-primary" />
            </span>
            <div>
              <p className="font-medium">Todavía no agregaste productos</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Explorá el catálogo y armá tu pedido.
              </p>
            </div>
            <Button asChild onClick={closeCart}>
              <Link to="/tienda">Ver tienda</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.productId} className="flex gap-3">
                    <Link to="/producto/$slug" params={{ slug: item.slug }} onClick={closeCart}>
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="size-20 rounded-xl border border-border object-cover"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to="/producto/$slug"
                          params={{ slug: item.slug }}
                          onClick={closeCart}
                          className="text-sm font-medium hover:text-primary"
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
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatPrice(item.price)} por unidad
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-full border border-border">
                          <button
                            className="flex size-9 items-center justify-center rounded-full hover:bg-secondary"
                            aria-label="Restar unidad"
                            onClick={() => setQuantity(item.productId, item.quantity - 1)}
                          >
                            <Minus className="size-4" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            className="flex size-9 items-center justify-center rounded-full hover:bg-secondary disabled:opacity-40"
                            aria-label="Sumar unidad"
                            disabled={item.quantity >= item.stock}
                            onClick={() => setQuantity(item.productId, item.quantity + 1)}
                          >
                            <Plus className="size-4" />
                          </button>
                        </div>
                        <span className="text-sm font-semibold">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3 border-t border-border bg-cream px-5 py-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Envío en Rosario</span>
                <span className="font-medium">
                  {shipping === 0 ? "Gratis" : formatPrice(shipping)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Retirando por el local el envío es sin costo. Envío gratis desde{" "}
                {formatPrice(storeConfig.shipping.freeFrom)}.
              </p>
              <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
                <span>Total estimado</span>
                <span>{formatPrice(subtotal + shipping)}</span>
              </div>
              <Button asChild size="lg" className="w-full" onClick={closeCart}>
                <Link to="/checkout">Continuar compra</Link>
              </Button>
              <Button asChild variant="outline" className="w-full" onClick={closeCart}>
                <Link to="/carrito">Ver carrito completo</Link>
              </Button>
              <button
                onClick={closeCart}
                className="w-full py-1 text-sm text-muted-foreground underline-offset-4 hover:underline"
              >
                Seguir comprando
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
