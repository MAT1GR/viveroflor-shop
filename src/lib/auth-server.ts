import { createServerFn } from "@tanstack/react-start";

export const loginFn = createServerFn({ method: "POST" })
  .validator((data: { user: string; pass: string }) => data)
  .handler(async ({ data }) => {
    const { checkCredentials, isAuthConfigured, startSession } = await import("./session.server");

    if (!isAuthConfigured()) {
      return {
        success: false,
        error:
          "El panel no está configurado. Faltan ADMIN_USER, ADMIN_PASSWORD y ADMIN_SESSION_SECRET.",
      };
    }

    if (!checkCredentials(data.user, data.pass)) {
      return { success: false, error: "Credenciales incorrectas" };
    }

    await startSession();
    return { success: true };
  });

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  const { endSession } = await import("./session.server");
  endSession();
  return { success: true };
});

export const checkAuthFn = createServerFn({ method: "GET" }).handler(async () => {
  const { isAuthenticated } = await import("./session.server");
  return { isAuthenticated: await isAuthenticated() };
});
