import { createServerFn } from "@tanstack/react-start";
import { db, withWriteTransaction } from "./db";
import { requireAdmin } from "./session.server";
import { priceOrder } from "./pricing-server";
import { returnStock, takeStock } from "./stock-server";
import { newOrderNumber, type Order, type OrderStatus } from "./orders";
import type { CartItem } from "./cart";

type Row = Record<string, unknown>;

const mapOrder = (row: Row): Order =>
  ({
    ...row,
    discount: Number(row["discount"] ?? 0),
    customer: JSON.parse(row["customer"] as string),
    items: JSON.parse(row["items"] as string),
    shipping_address: row["shipping_address"]
      ? JSON.parse(row["shipping_address"] as string)
      : null,
  }) as Order;

export const getOrdersFn = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const result = await db.execute("SELECT * FROM orders ORDER BY created_at DESC");
  return result.rows.map(mapOrder);
});

export const getOrderByNumberFn = createServerFn({ method: "GET" })
  .validator((number: string) => number)
  .handler(async ({ data: number }) => {
    const result = await db.execute({
      sql: "SELECT * FROM orders WHERE number = ?",
      args: [number],
    });
    if (result.rows.length === 0) return null;
    return mapOrder(result.rows[0]!);
  });

/**
 * Crea el pedido. En una sola transacción: recalcula los importes contra la
 * base, descuenta el stock y guarda la fila. Si algo falla —por ejemplo se
 * agotó una planta entre que el cliente cargó el carrito y apretó pagar— no
 * queda nada a medias.
 *
 * El número de pedido lo genera el servidor: es la clave con la que el
 * cliente y el vivero después identifican la compra por WhatsApp.
 */
export const saveOrderFn = createServerFn({ method: "POST" })
  .validator((data: Order) => data)
  .handler(async ({ data }) => {
    const now = new Date().toISOString();

    // La columna `number` es UNIQUE: si dos pedidos caen en el mismo número,
    // el INSERT falla y reintentamos con otro.
    for (let attempt = 0; attempt < 5; attempt++) {
      const number = newOrderNumber();

      try {
        return await withWriteTransaction(async (tx) => {
          const priced = await priceOrder(
            data.items,
            data.shipping_method,
            data.payment_method,
            tx,
          );

          await takeStock(tx, priced.items);

          await tx.execute({
            sql: `INSERT INTO orders (
              id, number, customer, items, subtotal, shipping_cost, discount, total,
              shipping_method, shipping_address, status, payment_method, payment_status,
              notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              data.id,
              number,
              JSON.stringify(data.customer),
              JSON.stringify(priced.items),
              priced.subtotal,
              priced.shipping_cost,
              priced.discount,
              priced.total,
              data.shipping_method,
              data.shipping_address ? JSON.stringify(data.shipping_address) : null,
              "pendiente",
              data.payment_method,
              "pendiente",
              data.notes ?? null,
              now,
              now,
            ],
          });

          return { number, ...priced };
        });
      } catch (error) {
        if (isDuplicateNumber(error)) continue;
        throw error;
      }
    }

    throw new Error("No pudimos generar un número de pedido. Intentá de nuevo.");
  });

const isDuplicateNumber = (error: unknown) =>
  error instanceof Error && /UNIQUE constraint failed: orders\.number/i.test(error.message);

/**
 * Cambia el estado desde el panel. Cancelar devuelve el stock; sacar un pedido
 * de "cancelado" lo vuelve a descontar (y falla si mientras tanto se agotó).
 *
 * Como el cobro se coordina por WhatsApp y no hay pasarela que avise, el
 * `payment_status` se deduce del estado: marcar "pagado" (o cualquier estado
 * posterior) da el pago por acreditado, y cancelar lo rechaza.
 */
export const updateOrderStatusFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; status: OrderStatus }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();

    const found = await db.execute({
      sql: "SELECT status, items FROM orders WHERE id = ?",
      args: [data.id],
    });
    const row = found.rows[0];
    if (!row) throw new Error("El pedido no existe.");

    const current = String(row["status"]) as OrderStatus;
    if (current === data.status) return { success: true };

    const items = JSON.parse(String(row["items"])) as CartItem[];
    const now = new Date().toISOString();

    await withWriteTransaction(async (tx) => {
      if (data.status === "cancelado") {
        await returnStock(tx, items);
      } else if (current === "cancelado") {
        await takeStock(tx, items);
      }

      await tx.execute({
        sql: "UPDATE orders SET status = ?, payment_status = ?, updated_at = ? WHERE id = ?",
        args: [data.status, paymentStatusFor(data.status), now, data.id],
      });
    });

    return { success: true };
  });

const PAID_STATUSES: OrderStatus[] = ["pagado", "preparando", "listo", "enviado", "entregado"];

const paymentStatusFor = (status: OrderStatus): Order["payment_status"] => {
  if (status === "cancelado") return "rechazado";
  return PAID_STATUSES.includes(status) ? "aprobado" : "pendiente";
};
