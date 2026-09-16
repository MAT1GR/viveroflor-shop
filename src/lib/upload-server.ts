import { createServerFn } from "@tanstack/react-start";
import { db } from "./db";
import { requireAdmin } from "./session.server";

/** 1 MB. El admin ya comprime a ~200 KB antes de subir. */
const MAX_BYTES = 1024 * 1024;

const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

/**
 * Las imágenes se guardan en la base, no en disco: Cloudflare Workers tiene el
 * filesystem de sólo lectura y cada deploy descarta lo que se hubiera escrito.
 */
export const uploadImageFn = createServerFn({ method: "POST" })
  .validator((formData: FormData) => formData)
  .handler(async ({ data }) => {
    await requireAdmin();

    const file = data.get("file");
    if (!(file instanceof File)) throw new Error("No se recibió ninguna imagen.");

    const ext = ALLOWED.get(file.type);
    if (!ext) throw new Error("Formato no soportado. Usá JPG, PNG, WebP o AVIF.");

    const bytes = new Uint8Array(await file.arrayBuffer());
    if (bytes.byteLength === 0) throw new Error("La imagen está vacía.");
    if (bytes.byteLength > MAX_BYTES) throw new Error("La imagen supera 1 MB.");

    const id = crypto.randomUUID();
    await db.execute({
      sql: "INSERT INTO uploads (id, mime, bytes, created_at) VALUES (?, ?, ?, ?)",
      args: [id, file.type, bytes, new Date().toISOString()],
    });

    return { url: `/api/uploads/${id}.${ext}` };
  });
