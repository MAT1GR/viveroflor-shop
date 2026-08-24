import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ProductCard } from "./ProductCard";
import { categories, products as allProducts, type Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/store-config";

type Sort = "relevancia" | "precio-asc" | "precio-desc" | "nuevos";

const MAX_PRICE = 40000;

function Filters({
  cats,
  setCats,
  maxPrice,
  setMaxPrice,
  onlyStock,
  setOnlyStock,
  onlyOffers,
  setOnlyOffers,
  lockCategory,
  reset,
}: {
  cats: string[];
  setCats: (v: string[]) => void;
  maxPrice: number;
  setMaxPrice: (v: number) => void;
  onlyStock: boolean;
  setOnlyStock: (v: boolean) => void;
  onlyOffers: boolean;
  setOnlyOffers: (v: boolean) => void;
  lockCategory?: boolean;
  reset: () => void;
}) {
  return (
    <div className="space-y-7">
      {!lockCategory && (
        <div>
          <p className="text-sm font-semibold">Categorías</p>
          <div className="mt-3 space-y-2.5">
            {categories.map((c) => (
              <label key={c.id} className="flex cursor-pointer items-center gap-2.5 text-sm">
                <Checkbox
                  checked={cats.includes(c.id)}
                  onCheckedChange={(v) =>
                    setCats(v ? [...cats, c.id] : cats.filter((x) => x !== c.id))
                  }
                />
                <span>
                  {c.emoji} {c.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-sm font-semibold">Precio máximo</p>
        <input
          type="range"
          min={5000}
          max={MAX_PRICE}
          step={1000}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          aria-label="Precio máximo"
          className="mt-4 w-full accent-[var(--primary)]"
        />
        <p className="mt-1 text-sm text-muted-foreground">Hasta {formatPrice(maxPrice)}</p>
      </div>

      <div className="space-y-2.5">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <Checkbox checked={onlyStock} onCheckedChange={(v) => setOnlyStock(!!v)} />
          Solo con stock
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <Checkbox checked={onlyOffers} onCheckedChange={(v) => setOnlyOffers(!!v)} />
          Solo ofertas
        </label>
      </div>

      <Button variant="outline" className="w-full" onClick={reset}>
        Limpiar filtros
      </Button>
    </div>
  );
}

export function ShopView({
  initialQuery = "",
  fixedCategory,
  source,
}: {
  initialQuery?: string;
  fixedCategory?: string;
  source?: Product[];
}) {
  const [query, setQuery] = useState(initialQuery);
  const [cats, setCats] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [onlyStock, setOnlyStock] = useState(false);
  const [onlyOffers, setOnlyOffers] = useState(false);
  const [sort, setSort] = useState<Sort>("relevancia");

  const reset = () => {
    setCats([]);
    setMaxPrice(MAX_PRICE);
    setOnlyStock(false);
    setOnlyOffers(false);
  };

  const results = useMemo(() => {
    const base = source ?? allProducts.filter((p) => p.active);
    const q = query.trim().toLowerCase();
    let list = base.filter((p) => {
      if (fixedCategory && p.category_id !== fixedCategory) return false;
      if (cats.length && !cats.includes(p.category_id)) return false;
      if (p.price > maxPrice) return false;
      if (onlyStock && p.stock <= 0) return false;
      if (onlyOffers && !(p.compare_price && p.compare_price > p.price)) return false;
      if (q && !`${p.name} ${p.description} ${p.features.join(" ")}`.toLowerCase().includes(q))
        return false;
      return true;
    });
    list = [...list];
    if (sort === "precio-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "precio-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "nuevos")
      list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    if (sort === "relevancia") list.sort((a, b) => b.sold - a.sold);
    return list;
  }, [source, query, cats, maxPrice, onlyStock, onlyOffers, sort, fixedCategory]);

  const filterProps = {
    cats,
    setCats,
    maxPrice,
    setMaxPrice,
    onlyStock,
    setOnlyStock,
    onlyOffers,
    setOnlyOffers,
    lockCategory: !!fixedCategory,
    reset,
  };

  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <Filters {...filterProps} />
        </div>
      </aside>

      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en el catálogo…"
            className="h-11 sm:max-w-xs"
            aria-label="Buscar productos"
          />
          <div className="flex flex-1 items-center justify-end gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-11 lg:hidden">
                  <SlidersHorizontal className="size-4" /> Filtros
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[86vw] max-w-sm overflow-y-auto p-6">
                <p className="mb-6 font-display text-lg font-semibold">Filtros</p>
                <Filters {...filterProps} />
              </SheetContent>
            </Sheet>

            <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
              <SelectTrigger className="h-11 w-[190px]" aria-label="Ordenar">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevancia">Más vendidos</SelectItem>
                <SelectItem value="nuevos">Más nuevos</SelectItem>
                <SelectItem value="precio-asc">Precio: menor a mayor</SelectItem>
                <SelectItem value="precio-desc">Precio: mayor a menor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          {results.length} {results.length === 1 ? "producto" : "productos"}
        </p>

        {results.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <p className="font-display text-lg font-semibold">No encontramos productos</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Probá con otra búsqueda o quitá algunos filtros.
            </p>
            <Button variant="outline" className="mt-5" onClick={reset}>
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
