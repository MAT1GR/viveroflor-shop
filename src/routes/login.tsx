import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginFn, checkAuthFn } from "@/lib/auth-server";
import { LogoMark } from "@/components/site/Logo";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const { isAuthenticated } = await checkAuthFn();
    if (isAuthenticated) {
      throw redirect({ to: "/admin" });
    }
  },
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await loginFn({ data: { user, pass } });
      if (res.success) {
        navigate({ to: "/admin" });
      } else {
        setError(res.error || "Error al iniciar sesión");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream/30 p-4">
      <div className="w-full max-w-sm rounded-3xl border bg-card p-8 shadow-soft">
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark size={72} />
          <h1 className="mt-4 font-display text-2xl font-bold">Panel de Control</h1>
          <p className="text-sm text-muted-foreground">Ingresa tus credenciales para continuar</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user">Usuario</Label>
            <Input
              id="user"
              autoComplete="username"
              required
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pass">Contraseña</Label>
            <Input
              id="pass"
              type="password"
              autoComplete="current-password"
              required
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
          </div>

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Ingresar
          </Button>
        </form>
      </div>
    </div>
  );
}
