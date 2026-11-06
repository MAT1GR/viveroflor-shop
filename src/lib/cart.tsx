import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type { Product, ProductVariant } from "./catalog";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  quantity: number;
  /** Color elegido, si el producto tiene colores. */
  variantId?: string;
  variantName?: string;
};

/** Identifica una línea del carrito: el mismo producto en dos colores son dos líneas. */
export const cartKey = (item: { productId: string; variantId?: string | undefined }) =>
  item.variantId ? `${item.productId}::${item.variantId}` : item.productId;

/** Nombre para mostrar: "Maceta Cerámica (Rojo)". */
export const itemLabel = (item: Pick<CartItem, "name" | "variantName">) =>
  item.variantName ? `${item.name} (${item.variantName})` : item.name;

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (
    product: Product,
    quantity?: number,
    options?: { silent?: boolean; variant?: ProductVariant | undefined },
  ) => void;
  /** Recibe la clave de la línea (`cartKey(item)`). */
  remove: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
};

const STORAGE_KEY = "viveroflor.cart.v1";
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* carrito corrupto: se ignora */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add = useCallback(
    (
      product: Product,
      quantity = 1,
      options?: { silent?: boolean; variant?: ProductVariant | undefined },
    ) => {
      const variant = options?.variant;
      const label = variant ? `${product.name} (${variant.name})` : product.name;
      const stock = variant ? variant.stock : product.stock;
      if (stock <= 0) {
        toast.error("Sin stock", { description: `${label} no está disponible por ahora.` });
        return;
      }
      const key = cartKey({ productId: product.id, variantId: variant?.id });
      setItems((prev) => {
        const existing = prev.find((i) => cartKey(i) === key);
        if (existing) {
          const next = Math.min(existing.quantity + quantity, stock);
          if (next === existing.quantity) {
            toast.info("Alcanzaste el stock disponible", {
              description: `Quedan ${stock} unidades de ${label}.`,
            });
          }
          return prev.map((i) => (cartKey(i) === key ? { ...i, quantity: next, stock } : i));
        }
        return [
          ...prev,
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            image:
              variant?.image ||
              product.images[0] ||
              product.variants?.find((v) => v.image)?.image ||
              "",
            stock,
            quantity: Math.min(quantity, stock),
            ...(variant ? { variantId: variant.id, variantName: variant.name } : {}),
          },
        ];
      });
      if (!options?.silent) {
        toast.success("Agregado al carrito", { description: label });
      }
    },
    [],
  );

  const remove = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => cartKey(i) !== key));
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setItems((prev) =>
      prev.flatMap((i) => {
        if (cartKey(i) !== key) return [i];
        const next = Math.max(0, Math.min(quantity, i.stock));
        return next === 0 ? [] : [{ ...i, quantity: next }];
      }),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((acc, i) => acc + i.quantity, 0);
    const subtotal = items.reduce((acc, i) => acc + i.quantity * i.price, 0);
    return {
      items,
      count,
      subtotal,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      add,
      remove,
      setQuantity,
      clear,
    };
  }, [items, isOpen, add, remove, setQuantity, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
