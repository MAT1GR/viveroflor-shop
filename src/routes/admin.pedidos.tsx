import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight, MessageCircle } from "lucide-react";
import { getOrdersFn, updateOrderStatusFn } from "@/lib/orders-server";
import { statusLabels, type Order, type OrderStatus } from "@/lib/orders";
import { formatPrice, storeConfig } from "@/lib/store-config";
import { paymentMethodLabel, type PaymentMethodId } from "@/lib/payments";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/pedidos")({
  loader: () => getOrdersFn(),
  component: AdminPedidos,
});

function AdminPedidos() {
  const orders = Route.useLoaderData();
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    setUpdating(id);
    setError(null);
    try {
      await updateOrderStatusFn({ data: { id, status } });
      await router.invalidate();
    } catch (err) {
      // Pasa, por ejemplo, al sacar un pedido de "cancelado" cuando ya no hay stock.
      setError(err instanceof Error ? err.message : "No pudimos cambiar el estado.");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Pedidos</h1>
        <p className="text-sm text-muted-foreground">
          Cancelar un pedido devuelve el stock a la tienda.
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="rounded-xl border bg-card">
        <div className="w-full overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="w-10 px-4 py-4" />
                <th className="px-6 py-4 font-medium">Pedido</th>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Entrega</th>
                <th className="px-6 py-4 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No hay pedidos todavía.
                  </td>
                </tr>
              )}
              {orders.map((order) => {
                const open = openId === order.id;
                return (
                  <Fragment key={order.id}>
                    <tr className="bg-card hover:bg-muted/50">
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          aria-label={open ? "Ocultar detalle" : "Ver detalle"}
                          aria-expanded={open}
                          onClick={() => setOpenId(open ? null : order.id)}
                          className="rounded p-1 text-muted-foreground hover:bg-muted"
                        >
                          {open ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold">{order.number}</span>
                        <div className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleString("es-AR")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {order.customer.first_name} {order.customer.last_name}
                        <div className="text-xs text-muted-foreground">{order.customer.email}</div>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {formatPrice(order.total)}
                        {order.discount > 0 && (
                          <div className="text-xs text-primary">
                            -{formatPrice(order.discount)} efectivo
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {order.shipping_method === "pickup" ? "Retiro" : "Envío"}
                        <div className="text-xs text-muted-foreground">
                          pago {order.payment_status}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Select
                          disabled={updating === order.id}
                          value={order.status}
                          onValueChange={(v) => handleStatusChange(order.id, v as OrderStatus)}
                        >
                          <SelectTrigger className="h-8 w-[140px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusLabels).map(([val, label]) => (
                              <SelectItem key={val} value={val} className="text-xs">
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                    {open && (
                      <tr className="bg-muted/30">
                        <td colSpan={6} className="px-6 py-5">
                          <OrderDetail order={order} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OrderDetail({ order }: { order: Order }) {
  const addr = order.shipping_address;
  const digits = order.customer.phone.replace(/\D/g, "");
  const waNumber = digits.length > 10 ? digits : `549${digits}`;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-3 text-sm">
        <Field label="Entrega">
          {order.shipping_method === "delivery" && addr ? (
            <>
              {addr.street} {addr.number}
              {addr.apartment ? `, ${addr.apartment}` : ""}
              {addr.neighborhood ? ` · ${addr.neighborhood}` : ""}
              <div className="text-muted-foreground">{addr.city}</div>
            </>
          ) : (
            <span className="text-muted-foreground">
              Retiro por el local · {storeConfig.address}
            </span>
          )}
        </Field>

        <Field label="Contacto">
          {order.customer.phone}
          <div className="text-muted-foreground">{order.customer.email}</div>
          <a
            href={`https://wa.me/${waNumber}`}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-primary hover:underline"
          >
            <MessageCircle className="h-3.5 w-3.5" /> Escribirle por WhatsApp
          </a>
        </Field>

        <Field label="Pago">
          {paymentMethodLabel(order.payment_method as PaymentMethodId)} · pago{" "}
          {order.payment_status}
        </Field>

        {order.notes && <Field label="Notas del cliente">{order.notes}</Field>}
      </div>

      <div className="rounded-lg border bg-card p-4">
        <p className="text-xs font-semibold uppercase text-muted-foreground">Productos</p>
        <ul className="mt-3 space-y-2 text-sm">
          {order.items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-3">
              <span>
                {item.quantity} × {item.name}
              </span>
              <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 border-t pt-3 text-sm">
          <Row label="Subtotal" value={formatPrice(order.subtotal)} />
          {order.discount > 0 && (
            <Row label="Descuento en efectivo" value={`-${formatPrice(order.discount)}`} />
          )}
          <Row
            label="Envío"
            value={order.shipping_cost === 0 ? "Gratis" : formatPrice(order.shipping_cost)}
          />
          <div className="flex justify-between border-t pt-2 font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </dl>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
