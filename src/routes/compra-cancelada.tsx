import { createFileRoute, Link } from "@tanstack/react-router";
import { RefreshCw, XCircle } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { waLink } from "@/lib/store-config";

export const Route = createFileRoute("/compra-cancelada")({
  head: () => ({
    meta: [
      { title: "Pago no completado · ViveroFlor" },
      { name: "description", content: "El pago no se completó. Tu carrito sigue guardado para reintentar." },
      { property: "og:title", content: "Pago no completado · ViveroFlor" },
      { property: "og:description", content: "Reintentá el pago con Mercado Pago o escribinos por WhatsApp." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CanceledPage,
});

function CanceledPage() {
  return (
    <SiteShell>
      <div className="container-page max-w-2xl py-16">
        <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-secondary">
            <XCircle className="size-8 text-destructive" />
          </span>
          <h1 className="mt-5 font-display text-3xl font-semibold">El pago no se completó</h1>
          <p className="mt-2 text-muted-foreground">
            No se realizó ningún cargo. Tu carrito quedó guardado, así que podés reintentar el pago cuando
            quieras o elegir otro método.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link to="/checkout">
                <RefreshCw className="mr-2 size-4" /> Reintentar el pago
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={waLink("Hola! Tuve un problema al pagar mi pedido")} target="_blank" rel="noreferrer">
                Necesito ayuda
              </a>
            </Button>
          </div>
          <Link to="/tienda" className="mt-5 inline-block text-sm text-muted-foreground underline-offset-4 hover:underline">
            Volver a la tienda
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
