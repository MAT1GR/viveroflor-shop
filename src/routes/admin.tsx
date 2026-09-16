import { createFileRoute, Outlet, Link, redirect, useRouter } from "@tanstack/react-router";
import { Package, LogOut, ShoppingBag } from "lucide-react";
import { checkAuthFn, logoutFn } from "@/lib/auth-server";
import { LogoMark } from "@/components/site/Logo";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const { isAuthenticated } = await checkAuthFn();
    if (!isAuthenticated) {
      throw redirect({ to: "/login" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <LogoMark size={28} />
            <span className="font-display">ViveroFlor Admin</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4 mt-4 gap-2">
            <Link
              to="/admin/productos"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary [&.active]:bg-muted [&.active]:text-primary"
            >
              <Package className="h-4 w-4" />
              Productos
            </Link>
            <Link
              to="/admin/pedidos"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary [&.active]:bg-muted [&.active]:text-primary"
            >
              <ShoppingBag className="h-4 w-4" />
              Pedidos
            </Link>
          </nav>
        </div>
        <div className="mt-auto p-4">
          <button
            onClick={async () => {
              await logoutFn();
              router.navigate({ to: "/login" });
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64 w-full">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
