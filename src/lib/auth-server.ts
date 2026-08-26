import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";

const AUTH_COOKIE = "admin_session";
const VALID_TOKEN = "viveroflor-admin-token-2026";

// Credenciales temporales configuradas por defecto
const ADMIN_USER = "admin";
const ADMIN_PASS = "vivero2026";

export const loginFn = createServerFn({ method: "POST" })
  .validator((data: { user: string; pass: string }) => data)
  .handler(async ({ data }) => {
    if (data.user === ADMIN_USER && data.pass === ADMIN_PASS) {
      setCookie(AUTH_COOKIE, VALID_TOKEN, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1 semana
      });
      return { success: true };
    }
    
    return { success: false, error: "Credenciales incorrectas" };
  });

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  deleteCookie(AUTH_COOKIE, { path: "/" });
  return { success: true };
});

export const checkAuthFn = createServerFn({ method: "GET" }).handler(async () => {
  const token = getCookie(AUTH_COOKIE);
  return { isAuthenticated: token === VALID_TOKEN };
});
