import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadImageFn } from "@/lib/upload-server";
import { saveProductFn, getProductFn, deleteProductFn } from "@/lib/catalog-server";
import imageCompression from "browser-image-compression";
import { ArrowLeft, Loader2, Trash2, Upload, X } from "lucide-react";
import type { Product } from "@/lib/catalog";

export const Route = createFileRoute("/admin/productos/$id/edit")({
  loader: async ({ params }) => {
    const product = await getProductFn({ data: params.id });
    if (!product) throw new Error("Producto no encontrado");
    return product;
  },
  component: EditarProducto,
});

function EditarProducto() {
  const product = Route.useLoaderData();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<Product>(product);
  const [uploadingImg, setUploadingImg] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImg(true);
    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      });

      const formData = new FormData();
      formData.append("file", compressedFile, file.name);

      const res = await uploadImageFn({ data: formData });

      setForm((f) => ({
        ...f,
        images: [...(f.images || []), res.url],
      }));
    } catch (err) {
      console.error(err);
      alert("Error al subir la imagen");
    } finally {
      setUploadingImg(false);
    }
  };

  const removeImage = (index: number) => {
    setForm((f) => ({
      ...f,
      images: f.images?.filter((_, i) => i !== index),
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedProduct = {
        ...form,
        updated_at: new Date().toISOString(),
      };

      await saveProductFn({ data: updatedProduct });
      navigate({ to: "/admin/productos" });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;
    setDeleting(true);
    try {
      await deleteProductFn({ data: product.id });
      navigate({ to: "/admin/productos" });
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const set =
    (k: keyof Product) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const target = e.target;
      const val =
        target.type === "number"
          ? Number(target.value)
          : target instanceof HTMLInputElement && target.type === "checkbox"
            ? target.checked
            : target.value;
      setForm((f) => ({ ...f, [k]: val }));
    };

  const setArray =
    (k: "features" | "images") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const arr = e.target.value
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
      setForm((f) => ({ ...f, [k]: arr }));
    };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/productos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold font-display">Editar Producto</h1>
      </div>

      <form onSubmit={submit} className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-4 sm:col-span-2 md:col-span-1">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input required value={form.name} onChange={set("name")} />
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Input
                required
                value={form.category_id}
                onChange={set("category_id")}
                placeholder="plantas, macetas, etc."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Precio</Label>
                <Input required type="number" value={form.price} onChange={set("price")} />
              </div>
              <div className="space-y-2">
                <Label>Precio Anterior (Opcional)</Label>
                <Input
                  type="number"
                  value={form.compare_price || ""}
                  onChange={set("compare_price")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Stock</Label>
              <Input required type="number" value={form.stock} onChange={set("stock")} />
            </div>
            <div className="space-y-2">
              <Label>Tamaño / Medidas</Label>
              <Input
                value={form.size || ""}
                onChange={set("size")}
                placeholder="Alto aprox. 60 cm"
              />
            </div>
          </div>

          <div className="space-y-4 sm:col-span-2 md:col-span-1">
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                required
                value={form.description}
                onChange={set("description")}
                className="h-24"
              />
            </div>
            <div className="space-y-2">
              <Label>Cuidados</Label>
              <Textarea
                value={form.care || ""}
                onChange={set("care")}
                placeholder="Luz indirecta. Riego semanal."
              />
            </div>
            <div className="space-y-2">
              <Label>Características (separadas por coma)</Label>
              <Input
                value={form.features?.join(", ") || ""}
                onChange={setArray("features")}
                placeholder="Apta interior, Bajo mantenimiento"
              />
            </div>
            <div className="space-y-2">
              <Label>Imágenes</Label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {form.images?.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-md border overflow-hidden">
                    <img src={url} alt="preview" className="object-cover w-full h-full" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="relative overflow-hidden"
                  disabled={uploadingImg}
                >
                  {uploadingImg ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 size-4" />
                  )}
                  {uploadingImg ? "Subiendo..." : "Subir Foto"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </Button>
              </div>
            </div>
          </div>

          <div className="sm:col-span-2 border-t pt-4">
            <Label className="mb-3 block text-base">Opciones del producto</Label>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={form.active}
                  onChange={set("active")}
                  className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                />
                <Label htmlFor="active">Activo (visible)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={form.featured}
                  onChange={set("featured")}
                  className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                />
                <Label htmlFor="featured">Destacado en Portada</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="best_seller"
                  checked={form.best_seller}
                  onChange={set("best_seller")}
                  className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                />
                <Label htmlFor="best_seller">Etiqueta "Más vendido"</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_new"
                  checked={form.is_new}
                  onChange={set("is_new")}
                  className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                />
                <Label htmlFor="is_new">Etiqueta "Nuevo"</Label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between border-t pt-4">
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Eliminar
          </Button>
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link to="/admin/productos">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
