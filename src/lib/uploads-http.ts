import { db } from "./db";

const UPLOADS_PREFIX = "/api/uploads/";

/**
 * Sirve las imágenes de producto guardadas en la base.
 * Devuelve null cuando la URL no corresponde a un upload, para que el request
 * siga su camino normal hacia el handler de la app.
 */
export async function handleUploadRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith(UPLOADS_PREFIX)) return null;
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405 });
  }

  // El id es un UUID; la extensión del final es sólo cosmética.
  const id = url.pathname.slice(UPLOADS_PREFIX.length).replace(/\.[a-z0-9]+$/i, "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Not found", { status: 404 });

  const result = await db.execute({
    sql: "SELECT mime, bytes FROM uploads WHERE id = ?",
    args: [id],
  });

  const row = result.rows[0];
  if (!row) return new Response("Not found", { status: 404 });

  const bytes = row["bytes"] as ArrayBuffer | Uint8Array;
  const body = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);

  return new Response(request.method === "HEAD" ? null : new Uint8Array(body), {
    headers: {
      "content-type": String(row["mime"] ?? "application/octet-stream"),
      "content-length": String(body.byteLength),
      // El id es inmutable, así que el archivo nunca cambia.
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
