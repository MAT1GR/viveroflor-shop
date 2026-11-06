import type { Client, Transaction } from "@libsql/client";
import type { CartItem } from "./cart";
import type { ProductVariant } from "./catalog";

/** Cualquier cosa que sepa ejecutar SQL: el cliente o una transacción abierta. */
export type SqlExecutor = Pick<Client | Transaction, "execute">;

/**
 * Descuenta stock y suma la venta. La condición `stock >= ?` está en el WHERE,
 * así que dos pedidos simultáneos por la última unidad no pueden sobrevender:
 * el segundo no afecta ninguna fila y hacemos rollback.
 *
 * Si el ítem es de un color, también se descuenta del stock de ese color. Eso se
 * hace leyendo y reescribiendo el JSON de colores dentro de la misma transacción
 * de escritura, que es la que serializa los pedidos simultáneos.
 */
export async function takeStock(tx: SqlExecutor, items: CartItem[]) {
  const now = new Date().toISOString();
  for (const item of items) {
    if (item.variantId) {
      await moveVariantStock(tx, item, -item.quantity);
    }
    const result = await tx.execute({
      sql: `UPDATE products
              SET stock = stock - ?, sold = sold + ?, updated_at = ?
            WHERE id = ? AND stock >= ?`,
      args: [item.quantity, item.quantity, now, item.productId, item.quantity],
    });
    if (result.rowsAffected === 0) {
      throw new Error(`Nos quedamos sin stock de "${item.name}" mientras confirmabas el pedido.`);
    }
  }
}

/** Devuelve el stock de un pedido cancelado o de un pago que no prosperó. */
export async function returnStock(tx: SqlExecutor, items: CartItem[]) {
  const now = new Date().toISOString();
  for (const item of items) {
    if (item.variantId) {
      await moveVariantStock(tx, item, item.quantity);
    }
    await tx.execute({
      sql: `UPDATE products
              SET stock = stock + ?, sold = MAX(0, sold - ?), updated_at = ?
            WHERE id = ?`,
      args: [item.quantity, item.quantity, now, item.productId],
    });
  }
}

/** Suma (o resta, con `delta` negativo) unidades al stock de un color. */
async function moveVariantStock(tx: SqlExecutor, item: CartItem, delta: number) {
  const found = await tx.execute({
    sql: "SELECT variants FROM products WHERE id = ?",
    args: [item.productId],
  });
  const raw = found.rows[0]?.["variants"];
  const variants = raw ? (JSON.parse(String(raw)) as ProductVariant[]) : [];
  const variant = variants.find((v) => v.id === item.variantId);
  if (!variant) {
    // El color se borró del producto: al devolver stock no hay dónde sumarlo.
    if (delta > 0) return;
    throw new Error(
      `El color "${item.variantName ?? ""}" de "${item.name}" ya no está disponible.`,
    );
  }
  const next = variant.stock + delta;
  if (next < 0) {
    throw new Error(
      `Nos quedamos sin stock de "${item.name}" (${variant.name}) mientras confirmabas el pedido.`,
    );
  }
  variant.stock = next;
  await tx.execute({
    sql: "UPDATE products SET variants = ? WHERE id = ?",
    args: [JSON.stringify(variants), item.productId],
  });
}
