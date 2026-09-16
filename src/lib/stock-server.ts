import type { Client, Transaction } from "@libsql/client";
import type { CartItem } from "./cart";

/** Cualquier cosa que sepa ejecutar SQL: el cliente o una transacción abierta. */
export type SqlExecutor = Pick<Client | Transaction, "execute">;

/**
 * Descuenta stock y suma la venta. La condición `stock >= ?` está en el WHERE,
 * así que dos pedidos simultáneos por la última unidad no pueden sobrevender:
 * el segundo no afecta ninguna fila y hacemos rollback.
 */
export async function takeStock(tx: SqlExecutor, items: CartItem[]) {
  const now = new Date().toISOString();
  for (const item of items) {
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
    await tx.execute({
      sql: `UPDATE products
              SET stock = stock + ?, sold = MAX(0, sold - ?), updated_at = ?
            WHERE id = ?`,
      args: [item.quantity, item.quantity, now, item.productId],
    });
  }
}
