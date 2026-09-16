import { db } from "./db";
import type { CartItem } from "./cart";
import type { ShippingMethod } from "./orders";
import { canDeliver, promoDiscountFor, shippingCostFor, storeConfig } from "./store-config";

export type PricedOrder = {
  items: CartItem[];
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
};

/**
 * Recalcula el pedido con los precios que están en la base, no con los que
 * mandó el navegador. Todo lo que cobramos sale de acá.
 */
export async function priceOrder(
  items: CartItem[],
  shippingMethod: ShippingMethod,
  paymentMethod: string,
  /** Para poder correr dentro de la misma transacción que descuenta el stock. */
  executor: Pick<typeof db, "execute"> = db,
): Promise<PricedOrder> {
  if (items.length === 0) throw new Error("El carrito está vacío.");

  const ids = [...new Set(items.map((i) => i.productId))];
  const placeholders = ids.map(() => "?").join(",");
  const result = await executor.execute({
    sql: `SELECT id, name, slug, price, stock, active, images FROM products WHERE id IN (${placeholders})`,
    args: ids,
  });

  const byId = new Map(result.rows.map((r) => [String(r["id"]), r]));

  const priced: CartItem[] = items.map((item) => {
    const row = byId.get(item.productId);
    if (!row) throw new Error(`El producto "${item.name}" ya no está disponible.`);
    if (!row["active"]) throw new Error(`El producto "${row["name"]}" ya no está a la venta.`);

    const stock = Number(row["stock"]);
    const quantity = Math.max(1, Math.floor(item.quantity));
    if (quantity > stock) {
      throw new Error(`No hay stock suficiente de "${row["name"]}". Quedan ${stock}.`);
    }

    const images = row["images"] ? (JSON.parse(String(row["images"])) as string[]) : [];
    return {
      productId: String(row["id"]),
      slug: String(row["slug"]),
      name: String(row["name"]),
      price: Number(row["price"]),
      image: images[0] ?? "",
      stock,
      quantity,
    };
  });

  const subtotal = priced.reduce((acc, i) => acc + i.price * i.quantity, 0);

  if (shippingMethod === "delivery" && !canDeliver(subtotal)) {
    throw new Error(
      `El envío requiere una compra mínima de $${storeConfig.shipping.minOrderForDelivery}.`,
    );
  }

  const shipping_cost = shippingCostFor(subtotal, shippingMethod);
  const discount = promoDiscountFor(subtotal, paymentMethod);

  return {
    items: priced,
    subtotal,
    shipping_cost,
    discount,
    total: subtotal - discount + shipping_cost,
  };
}
