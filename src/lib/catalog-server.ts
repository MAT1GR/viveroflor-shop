import { createServerFn } from "@tanstack/react-start";
import { db } from "./db";
import type { Product } from "./catalog";

const mapProduct = (row: any): Product => ({
  ...row,
  active: !!row.active,
  featured: !!row.featured,
  best_seller: !!row.best_seller,
  is_new: !!row.is_new,
  features: row.features ? JSON.parse(row.features as string) : [],
  images: row.images ? JSON.parse(row.images as string) : [],
});

export const getProductsFn = createServerFn({ method: "GET" }).handler(async () => {
  const result = await db.execute("SELECT * FROM products ORDER BY created_at DESC");
  return result.rows.map(mapProduct);
});

export const getProductFn = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const result = await db.execute({
      sql: "SELECT * FROM products WHERE id = ?",
      args: [id]
    });
    if (result.rows.length === 0) return null;
    return mapProduct(result.rows[0]);
  });

export const getProductBySlugFn = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const result = await db.execute({
      sql: "SELECT * FROM products WHERE slug = ?",
      args: [slug]
    });
    if (result.rows.length === 0) return null;
    return mapProduct(result.rows[0]);
  });

export const saveProductFn = createServerFn({ method: "POST" })
  .validator((data: Product) => data)
  .handler(async ({ data }) => {
    const existing = await db.execute({ sql: "SELECT id FROM products WHERE id = ?", args: [data.id] });
    
    if (existing.rows.length > 0) {
      await db.execute({
        sql: `UPDATE products SET 
          name = ?, slug = ?, description = ?, price = ?, compare_price = ?, stock = ?, category_id = ?, 
          active = ?, featured = ?, best_seller = ?, is_new = ?, size = ?, care = ?, features = ?, images = ?, updated_at = ?
          WHERE id = ?`,
        args: [
          data.name, data.slug, data.description, data.price, data.compare_price || null, data.stock, data.category_id,
          data.active ? 1 : 0, data.featured ? 1 : 0, data.best_seller ? 1 : 0, data.is_new ? 1 : 0,
          data.size || null, data.care || null, JSON.stringify(data.features || []), JSON.stringify(data.images || []),
          new Date().toISOString(), data.id
        ]
      });
    } else {
      await db.execute({
        sql: `INSERT INTO products (
          id, name, slug, description, price, compare_price, stock, category_id, 
          active, featured, best_seller, is_new, size, care, features, images, sold, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          data.id, data.name, data.slug, data.description, data.price, data.compare_price || null, data.stock, data.category_id,
          data.active ? 1 : 0, data.featured ? 1 : 0, data.best_seller ? 1 : 0, data.is_new ? 1 : 0,
          data.size || null, data.care || null, JSON.stringify(data.features || []), JSON.stringify(data.images || []),
          0, new Date().toISOString(), new Date().toISOString()
        ]
      });
    }
    
    return { success: true };
  });

export const deleteProductFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await db.execute({ sql: "SELECT * FROM products WHERE id = ?", args: [id] }); // check if exists (optional)
    await db.execute({ sql: "DELETE FROM products WHERE id = ?", args: [id] });
    return { success: true };
  });
