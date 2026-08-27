import { createServerFn } from "@tanstack/react-start";
import { db } from "./db";
import type { Order, OrderStatus } from "./orders";

const mapOrder = (row: any): Order => ({
  ...row,
  customer: JSON.parse(row.customer as string),
  items: JSON.parse(row.items as string),
  shipping_address: row.shipping_address ? JSON.parse(row.shipping_address as string) : undefined,
});

export const getOrdersFn = createServerFn({ method: "GET" }).handler(async () => {
  const result = await db.execute("SELECT * FROM orders ORDER BY created_at DESC");
  return result.rows.map(mapOrder);
});

export const getOrderByNumberFn = createServerFn({ method: "GET" })
  .validator((number: string) => number)
  .handler(async ({ data: number }) => {
    const result = await db.execute({
      sql: "SELECT * FROM orders WHERE number = ?",
      args: [number]
    });
    if (result.rows.length === 0) return null;
    return mapOrder(result.rows[0]);
  });

export const saveOrderFn = createServerFn({ method: "POST" })
  .validator((data: Order) => data)
  .handler(async ({ data }) => {
    await db.execute({
      sql: `INSERT INTO orders (
        id, number, customer, items, subtotal, shipping_cost, total, 
        shipping_method, shipping_address, status, payment_method, payment_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        data.id, data.number, JSON.stringify(data.customer), JSON.stringify(data.items), data.subtotal, data.shipping_cost, data.total,
        data.shipping_method, data.shipping_address ? JSON.stringify(data.shipping_address) : null, data.status, data.payment_method, data.payment_status,
        data.created_at, data.updated_at
      ]
    });
    return { success: true };
  });

export const updateOrderStatusFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; status: OrderStatus }) => data)
  .handler(async ({ data }) => {
    await db.execute({
      sql: "UPDATE orders SET status = ?, updated_at = ? WHERE id = ?",
      args: [data.status, new Date().toISOString(), data.id]
    });
    return { success: true };
  });

export const updateOrderPaymentStatusFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; payment_status: string; status: OrderStatus }) => data)
  .handler(async ({ data }) => {
    await db.execute({
      sql: "UPDATE orders SET payment_status = ?, status = ?, updated_at = ? WHERE id = ?",
      args: [data.payment_status, data.status, new Date().toISOString(), data.id]
    });
    return { success: true };
  });
