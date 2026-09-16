import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { formatPromoEnd, getActivePromo, type ActivePromo } from "@/lib/store-config";

/**
 * Barra de la promo mensual. Se calcula en el cliente después de hidratar para
 * que el HTML cacheado del SSR no deje la promo pegada cuando termina la semana.
 */
export function PromoBanner() {
  const [promo, setPromo] = useState<ActivePromo | null>(null);

  useEffect(() => {
    setPromo(getActivePromo());
  }, []);

  if (!promo) return null;

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container-page flex flex-wrap items-center justify-center gap-x-2 gap-y-1 py-2 text-center text-sm">
        <Sparkles className="size-4 shrink-0" aria-hidden="true" />
        <span className="font-semibold">{promo.shortLabel}</span>
        <span className="opacity-85">
          Hasta el {formatPromoEnd(promo.endsOn)}, abonando al retirar.
        </span>
      </div>
    </div>
  );
}
