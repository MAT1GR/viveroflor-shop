import { createClient, type Transaction } from "@libsql/client";

const url = process.env["TURSO_URL"] || "file:local.db";
const authToken = process.env["TURSO_AUTH_TOKEN"];

export const db = createClient(authToken ? { url, authToken } : { url });

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
      discount REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL,
      shipping_method TEXT NOT NULL,
      shipping_address TEXT, -- JSON
      status TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      notes TEXT,
      updated_at TEXT NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS uploads (
      id TEXT PRIMARY KEY,
      mime TEXT NOT NULL,
      bytes BLOB NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  await db.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_number ON orders (number)");

  // Migraciones incrementales para bases creadas antes de que existieran las columnas.
  await addColumnIfMissing("orders", "discount", "REAL NOT NULL DEFAULT 0");
  await addColumnIfMissing("orders", "notes", "TEXT");
}

async function addColumnIfMissing(table: string, column: string, definition: string) {
  const info = await db.execute(`PRAGMA table_info(${table})`);
  if (info.rows.some((r) => r["name"] === column)) return;
  await db.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

/**
 * Corre `fn` dentro de una transacción de escritura y hace rollback si algo
 * falla.
 *
 * Reintenta ante SQLITE_BUSY: con el archivo local dos checkouts simultáneos
 * chocan por el lock del archivo (Turso serializa las escrituras del lado del
 * servidor, así que allá casi no pasa). Sin esto, el segundo cliente vería un
 * "database is locked" en vez de comprar bien.
 */
export async function withWriteTransaction<T>(
  fn: (tx: Transaction) => Promise<T>,
  { retries = 4 } = {},
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    let tx: Transaction;
    try {
      tx = await db.transaction("write");
    } catch (error) {
      if (isBusy(error) && attempt < retries) {
        await sleep(attempt);
        continue;
      }
      throw error;
    }

    try {
      const result = await fn(tx);
      await tx.commit();
      return result;
    } catch (error) {
      await tx.rollback().catch(() => {});
      if (isBusy(error) && attempt < retries) {
        await sleep(attempt);
        continue;
      }
      throw error;
    }
  }
}

const isBusy = (error: unknown) =>
  error instanceof Error && /SQLITE_BUSY|database is locked/i.test(error.message);

/** Espera creciente y con jitter, para que dos clientes no reintenten al unísono. */
const sleep = (attempt: number) =>
  new Promise((resolve) => setTimeout(resolve, 25 * 2 ** attempt + Math.random() * 25));
