import { cn } from "@/lib/utils";
import { storeConfig } from "@/lib/store-config";

export const LOGO_SRC = "/assets/logo-viveroflor.png";

/**
 * Isotipo de la marca (círculo con la corona de flores).
 * El archivo ya viene recortado y cuadrado, así que basta con fijar el lado.
 */
export function LogoMark({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <img
      src={LOGO_SRC}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={cn("shrink-0 select-none object-contain", className)}
      style={{ width: size, height: size }}
    />
  );
}

/**
 * Isotipo + wordmark. El logo ya trae el nombre adentro, pero a tamaños chicos
 * no se lee, así que el wordmark al lado se mantiene para accesibilidad y legibilidad.
 */
export function Logo({
  size = 40,
  className,
  showWordmark = true,
  wordmarkClassName,
}: {
  size?: number;
  className?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <LogoMark size={size} />
      {showWordmark && (
        <span className={cn("font-display font-semibold tracking-tight", wordmarkClassName)}>
          {storeConfig.name}
        </span>
      )}
    </span>
  );
}
