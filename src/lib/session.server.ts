import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";

/**
 * Sesión del panel de administración. Módulo server-only: no debe importarse
 * desde componentes, sólo desde el cuerpo de un `createServerFn().handler()`.
 */

export const AUTH_COOKIE = "admin_session";
const SESSION_DAYS = 7;

const isProduction = process.env["NODE_ENV"] === "production";

/** Credenciales del panel. En producción son obligatorias por variable de entorno. */
const ADMIN_USER = process.env["ADMIN_USER"] ?? (isProduction ? "" : "admin");
const ADMIN_PASS = process.env["ADMIN_PASSWORD"] ?? (isProduction ? "" : "vivero2026");
const SESSION_SECRET =
  process.env["ADMIN_SESSION_SECRET"] ?? (isProduction ? "" : "dev-secret-no-usar-en-produccion");

export const isAuthConfigured = () => Boolean(ADMIN_USER && ADMIN_PASS && SESSION_SECRET);

const encoder = new TextEncoder();

const b64url = (bytes: ArrayBuffer | Uint8Array) => {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of view) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

async function sign(payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return b64url(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
}

/** Comparación en tiempo constante para no filtrar el token por timing. */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function checkCredentials(user: string, pass: string) {
  return isAuthConfigured() && safeEqual(user, ADMIN_USER) && safeEqual(pass, ADMIN_PASS);
}

export async function startSession() {
  const payload = b64url(
    encoder.encode(JSON.stringify({ exp: Date.now() + SESSION_DAYS * 864e5 })),
  );
  setCookie(AUTH_COOKIE, `${payload}.${await sign(payload)}`, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
  });
}

export function endSession() {
  deleteCookie(AUTH_COOKIE, { path: "/" });
}

export async function isAuthenticated() {
  const token = getCookie(AUTH_COOKIE);
  if (!token || !SESSION_SECRET) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  if (!safeEqual(signature, await sign(payload))) return false;

  try {
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as {
      exp?: number;
    };
    return typeof json.exp === "number" && json.exp > Date.now();
  } catch {
    return false;
  }
}

/** Corta la ejecución de un server function si quien llama no es el admin. */
export async function requireAdmin() {
  if (!(await isAuthenticated())) throw new Error("No autorizado.");
}
