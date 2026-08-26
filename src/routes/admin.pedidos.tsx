import { createFileRoute } from "@tanstack/react-router";
import { getOrdersFn, updateOrderStatusFn } from "@/lib/orders-server";
import { statusLabels, type OrderStatus } from "@/lib/orders";
import { formatPrice } from "@/lib/store-config";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/admin/pedidos")({
  loader: () => getOrdersFn(),
  component: AdminPedidos,
});

function AdminPedidos() {
  const orders = Route.useLoaderData();
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    setUpdating(id);
    await updateOrderStatusFn({ data: { id, status } });
    await router.invalidate();
    setUpdating(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display">Pedidos</h1>
      </div>
      <div className="rounded-xl border bg-card">
        <div className="w-full overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Pedido</th>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Envío</th>
                <th className="px-6 py-4 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No hay pedidos todavía.
                  </td>
                </tr>
              )}
              {orders.map((order) => (
                <tr key={order.id} className="bg-card hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <span className="font-semibold">{order.number}</span>
                    <div className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("es-AR")}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {order.customer.first_name} {order.customer.last_name}
                    <div className="text-xs text-muted-foreground">{order.customer.email}</div>
                  </td>
                  <td className="px-6 py-4 font-medium">{formatPrice(order.total)}</td>
                  <td className="px-6 py-4 capitalize">
                    {order.shipping_method === "pickup" ? "Retiro" : "Envío"}
                  </td>
                  <td className="px-6 py-4">
                    <Select
                      disabled={updating === order.id}
                      value={order.status}
                      onValueChange={(v) => handleStatusChange(order.id, v as OrderStatus)}
                    >
                      <SelectTrigger className="w-[140px] h-8 text-xs">
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
