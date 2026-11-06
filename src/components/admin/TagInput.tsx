import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
};

/**
 * Lista editable de textos: se escribe uno, se agrega con Enter, coma o el botón "+",
 * y cada uno se puede sacar con su X.
 */
export function TagInput({ value, onChange, placeholder }: Props) {
  const [draft, setDraft] = useState("");

  const add = (text: string) => {
    const nuevos = text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (nuevos.length === 0) return;
    const lower = value.map((v) => v.toLowerCase());
    const sinRepetir = nuevos.filter(
      (n, i) => !lower.includes(n.toLowerCase()) && nuevos.indexOf(n) === i,
    );
    if (sinRepetir.length) onChange([...value, ...sinRepetir]);
    setDraft("");
  };

  const remove = (index: number) => onChange(value.filter((_, i) => i !== index));

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      remove(value.length - 1);
    }
  };

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {value.map((tag, i) => (
            <li
              key={`${tag}-${i}`}
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={`Quitar ${tag}`}
                className="rounded-full p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => add(draft)}
          placeholder={placeholder}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => add(draft)}
          aria-label="Agregar característica"
        >
          <Plus className="size-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Escribí una y apretá Enter (o el +). Tocá la X para sacarla.
      </p>
    </div>
  );
}
