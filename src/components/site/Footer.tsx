import { Link } from "@tanstack/react-router";
import { Instagram, MapPin, Clock, MessageCircle } from "lucide-react";
import { storeConfig, waLink } from "@/lib/store-config";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-cream">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo size={56} wordmarkClassName="text-lg" />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Vivero en Rosario. Plantas seleccionadas, macetas de diseño y accesorios para que armes
            tus espacios verdes, con envío en la ciudad o retiro por el local.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide">Comprar</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/tienda" className="hover:text-primary">
                Tienda
              </Link>
            </li>
            <li>
              <Link to="/plantas" className="hover:text-primary">
                Plantas
              </Link>
            </li>
            <li>
              <Link to="/macetas" className="hover:text-primary">
                Macetas
              </Link>
            </li>
            <li>
              <Link to="/accesorios" className="hover:text-primary">
                Accesorios
              </Link>
            </li>
            <li>
              <Link to="/categorias" className="hover:text-primary">
                Categorías
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide">Ayuda</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/preguntas-frecuentes" className="hover:text-primary">
                Preguntas frecuentes
              </Link>
            </li>
            <li>
              <Link to="/preguntas-frecuentes" hash="envios" className="hover:text-primary">
                Envíos
              </Link>
            </li>
            <li>
              <Link to="/preguntas-frecuentes" hash="pagos" className="hover:text-primary">
                Medios de pago
              </Link>
            </li>
            <li>
              <Link to="/contacto" className="hover:text-primary">
                Contacto
              </Link>
            </li>
            <li>
              <Link to="/nosotros" className="hover:text-primary">
                Sobre nosotros
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide">Contacto</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>
              <a
                href={waLink("¡Hola ViveroFlor! Quería hacerles una consulta.")}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-primary"
              >
                <MessageCircle className="size-4" /> WhatsApp {storeConfig.phone}
              </a>
            </li>
            <li>
              <a
                href={storeConfig.instagram}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-primary"
              >
                <Instagram className="size-4" /> @viveroflor
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" /> {storeConfig.address}
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 size-4 shrink-0" /> {storeConfig.hours}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ViveroFlor. Rosario, Santa Fe.</p>
          <p>Confirmás tu pedido por WhatsApp: ahí coordinamos el pago y la entrega.</p>
        </div>
      </div>
    </footer>
  );
}
