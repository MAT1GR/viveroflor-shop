import { useState } from "react";
import imageCompression from "browser-image-compression";
import { ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadImageFn } from "@/lib/upload-server";
import type { ProductVariant } from "@/lib/catalog";

type Props = {
  value: ProductVariant[];
  onChange: (value: ProductVariant[]) => void;
};

const newVariant = (): ProductVariant => ({
  id: `var-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  name: "",
  hex: "#4a7c59",
  stock: 0,
  image: "",
});

/** Colores del producto: cada uno con nombre, muestra de color, cantidad y foto. */
export function VariantsEditor({ value, onChange }: Props) {
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const update = (id: string, patch: Partial<ProductVariant>) =>
    onChange(value.map((v) => (v.id === id ? { ...v, ...patch } : v)));

  const remove = (id: string) => onChange(value.filter((v) => v.id !== id));

  const upload = async (id: string, file: File | undefined) => {
    if (!file) return;
    setUploadingId(id);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      });
      const formData = new FormData();
      formData.append("file", compressed, file.name);
      const res = await uploadImageFn({ data: formData });
      update(id, { image: res.url });
    } catch (err) {
      console.error(err);
      alert("Error al subir la imagen");
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Sin colores. Si el producto viene en varios colores, agregalos acá con la cantidad y la
          foto de cada uno.
        </p>
      )}

      {value.map((v) => (
        <div
          key={v.id}
          className="flex flex-wrap items-center gap-3 rounded-lg border bg-background p-3"
        >
          <div className="relative size-16 shrink-0 overflow-hidden rounded-md border bg-muted">
            {uploadingId === v.id ? (
              <div className="flex size-full items-center justify-center">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : v.image ? (
              <>
                <img src={v.image} alt={v.name} className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => update(v.id, { image: "" })}
                  aria-label="Quitar foto"
                  className="absolute right-0.5 top-0.5 rounded-full bg-black/50 p-0.5 text-white"
                >
                  <X className="size-3" />
                </button>
              </>
            ) : (
              <label className="flex size-full cursor-pointer flex-col items-center justify-center text-[10px] text-muted-foreground hover:bg-muted/70">
                <ImagePlus className="size-5" />
                Foto
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    void upload(v.id, e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </div>

          <input
            type="color"
            value={v.hex}
            onChange={(e) => update(v.id, { hex: e.target.value })}
            aria-label="Color de muestra"
            className="size-9 shrink-0 cursor-pointer rounded border bg-transparent p-0.5"
          />

          <div className="min-w-32 flex-1 space-y-1">
            <span className="text-xs text-muted-foreground">Color</span>
            <Input
              required
              value={v.name}
              onChange={(e) => update(v.id, { name: e.target.value })}
              placeholder="Ej: Terracota"
            />
          </div>

          <div className="w-24 space-y-1">
            <span className="text-xs text-muted-foreground">Cantidad</span>
            <Input
              type="number"
              min={0}
              value={v.stock}
              onChange={(e) => update(v.id, { stock: Math.max(0, Number(e.target.value)) })}
            />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(v.id)}
            aria-label={`Quitar color ${v.name}`}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...value, newVariant()])}
      >
        <Plus className="mr-1 size-4" /> Agregar color
      </Button>
    </div>
  );
}
