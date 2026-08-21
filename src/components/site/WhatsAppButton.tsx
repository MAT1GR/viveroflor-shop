import { MessageCircle } from "lucide-react";
import { waLink } from "@/lib/store-config";

export function WhatsAppButton() {
  return (
    <a
      href={waLink("¡Hola ViveroFlor! Quería hacerles una consulta.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-5 right-4 z-40 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lift transition-transform hover:scale-105"
    >
      <MessageCircle className="size-6" />
    </a>
  );
}
