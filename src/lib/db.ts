import { createClient } from "@libsql/client";

const url = process.env.TURSO_URL || "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

export const db = createClient({
  url,
  authToken,
});

// Función para inicializar las tablas si no existen
export async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      compare_price REAL,
      stock INTEGER NOT NULL DEFAULT 0,
      category_id TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      featured INTEGER NOT NULL DEFAULT 0,
      best_seller INTEGER NOT NULL DEFAULT 0,
      is_new INTEGER NOT NULL DEFAULT 0,
      size TEXT,
      care TEXT,
      features TEXT, -- JSON
      images TEXT, -- JSON
      sold INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      number TEXT NOT NULL,
      customer TEXT NOT NULL, -- JSON
      items TEXT NOT NULL, -- JSON
      subtotal REAL NOT NULL,
      shipping_cost REAL NOT NULL,
      total REAL NOT NULL,
      shipping_method TEXT NOT NULL,
      shipping_address TEXT, -- JSON
      status TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}
