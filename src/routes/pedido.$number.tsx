import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, MapPin, MessageCircle, Truck } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { loadOrders, statusLabels, type Order } from "@/lib/orders";
import { paymentMethodLabel, type PaymentMethodId } from "@/lib/mercadopago";
import { formatPrice, storeConfig, waLink } from "@/lib/store-config";

import { getOrderByNumberFn } from "@/lib/orders-server";

export const Route = createFileRoute("/pedido/$number")({
  loader: async ({ params }) => {
    return await getOrderByNumberFn({ data: params.number });
  },
  head: () => ({
    meta: [
      { title: "Compra confirmada · ViveroFlor" },
      { name: "description", content: "Gracias por tu compra. Acá están los detalles de tu pedido en ViveroFlor." },
      { property: "og:title", content: "Compra confirmada · ViveroFlor" },
      { property: "og:description", content: "Seguimiento y detalle de tu pedido de plantas, macetas y accesorios." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const order = Route.useLoaderData();
  const { number } = Route.useParams();
  const ready = true;

  return (
    <SiteShell>
      <div className="container-page max-w-3xl py-12">
        <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-soft md:p-10">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-secondary">
            <CheckCircle2 className="size-8 text-primary" />
          </span>
          <h1 className="mt-5 font-display text-3xl font-semibold">¡Gracias por tu compra!</h1>
          <p className="mt-2 text-muted-foreground">
            Tu pedido <span className="font-semibold text-foreground">{number}</span> fue registrado. Te
            enviamos el detalle por email y te escribimos por WhatsApp para coordinar.
          </p>

          {ready && order && (
            <div className="mt-8 space-y-5 text-left">
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoBox
                  icon={<Clock className="size-4 text-primary" />}
                  title="Estado"
                  value={`${statusLabels[order.status]} · pago ${order.payment_status}`}
                />
                <InfoBox
                  icon={<MessageCircle className="size-4 text-primary" />}
                  title="Método de pago"
                  value={paymentMethodLabel(order.payment_method as PaymentMethodId)}
                />
                {order.shipping_method === "delivery" && order.shipping_address ? (
                  <InfoBox
                    icon={<Truck className="size-4 text-primary" />}
                    title={storeConfig.shipping.deliveryLabel}
                    value={`${order.shipping_address.street} ${order.shipping_address.number}${
                      order.shipping_address.apartment ? `, ${order.shipping_address.apartment}` : ""
                    } · ${order.shipping_address.city}`}
                  />
                ) : (
                  <InfoBox
                    icon={<MapPin className="size-4 text-primary" />}
                    title={storeConfig.shipping.pickupLabel}
                    value={`${storeConfig.address} · ${storeConfig.hours}`}
                  />
                )}
                <InfoBox
                  icon={<CheckCircle2 className="size-4 text-primary" />}
                  title="Contacto"
                  value={`${order.customer.first_name} ${order.customer.last_name} · ${order.customer.phone}`}
                />
              </div>

              <div className="rounded-2xl border border-border bg-cream p-5">
                <p className="font-display text-lg font-semibold">Detalle</p>
                <ul className="mt-3 space-y-3">
                  {order.items.map((i) => (
                    <li key={i.productId} className="flex items-center gap-3">
                      <img src={i.image} alt={i.name} loading="lazy" className="size-14 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{i.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {i.quantity} × {formatPrice(i.price)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold">{formatPrice(i.price * i.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 space-y-2 border-t border-border pt-3 text-sm">
                  <Row label="Subtotal" value={formatPrice(order.subtotal)} />
                  <Row
                    label="Envío"
                    value={order.shipping_cost === 0 ? "Gratis" : formatPrice(order.shipping_cost)}
                  />
                  <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {ready && !order && (
            <p className="mt-6 rounded-xl bg-secondary p-4 text-sm text-muted-foreground">
              No encontramos el detalle de este pedido.
              Escribinos por WhatsApp y lo revisamos juntos.
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <a href={waLink(`Hola! Consulto por mi pedido ${number}`)} target="_blank" rel="noreferrer">
                Escribir por WhatsApp
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/tienda">Seguir comprando</Link>
            </Button>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}

function InfoBox({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border p-4">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {title}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
