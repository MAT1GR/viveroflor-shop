import { createFileRoute, Link } from "@tanstack/react-router";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/store-config";
import { getProductsFn } from "@/lib/catalog-server";

export const Route = createFileRoute("/admin/productos/")({
  loader: () => getProductsFn(),
  component: AdminProducts,
});

function AdminProducts() {
  const products = Route.useLoaderData();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display">Productos</h1>
        <Button asChild>
          <Link to="/admin/productos/nuevo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Link>
        </Button>
      </div>
      <div className="rounded-xl border bg-card">
        <div className="w-full overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Producto</th>
                <th className="px-6 py-4 font-medium">Precio</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => (
                <tr key={product.id} className="bg-card hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium flex items-center gap-3">
                    {product.images?.[0] && (
                      <img src={product.images[0]} alt={product.name} className="h-10 w-10 rounded-md object-cover" />
                    )}
                    {product.name}
                  </td>
                  <td className="px-6 py-4">{formatPrice(product.price)}</td>
                  <td className="px-6 py-4">{product.stock}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        product.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button variant="outline" size="icon" asChild>
                      <Link to="/admin/productos/$id/edit" params={{ id: product.id }}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
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
