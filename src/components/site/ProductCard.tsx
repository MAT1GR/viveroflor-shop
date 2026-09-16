import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { categoryName, discountPercent, type Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/store-config";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const off = discountPercent(product);
  const outOfStock = product.stock <= 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <Link
        to="/producto/$slug"
        params={{ slug: product.slug }}
        className="relative block overflow-hidden bg-beige/50"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          width={900}
          height={900}
          className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {off > 0 && (
            <span className="rounded-full bg-sale px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-sale-foreground">
              Oferta -{off}%
            </span>
          )}
          {product.is_new && (
            <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground">
              Nuevo
            </span>
          )}
          {product.best_seller && !product.is_new && (
            <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-foreground">
              Más vendido
            </span>
          )}
        </div>
        {outOfStock && (
          <span className="absolute inset-x-3 bottom-3 rounded-full bg-foreground/85 py-1.5 text-center text-xs font-semibold text-background">
            Sin stock
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {categoryName(product.category_id)}
        </p>
        <h3 className="mt-1 font-display text-base font-semibold leading-snug">
          <Link to="/producto/$slug" params={{ slug: product.slug }}>
            {product.name}
          </Link>
        </h3>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-semibold">{formatPrice(product.price)}</span>
          {product.compare_price && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.compare_price)}
            </span>
          )}
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          {outOfStock
            ? "No disponible por ahora"
            : product.stock <= 5
              ? product.stock === 1
                ? "¡Última unidad!"
                : `Últimas ${product.stock} unidades`
              : "Disponible"}
        </p>

        <Button
          className="mt-4 w-full"
          disabled={outOfStock}
          onClick={() => add(product)}
          aria-label={`Agregar ${product.name} al carrito`}
        >
          <ShoppingBag className="size-4" />
          {outOfStock ? "Sin stock" : "Agregar al carrito"}
        </Button>
      </div>
    </article>
  );
}
