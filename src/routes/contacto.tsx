import { createFileRoute } from "@tanstack/react-router";
import { Clock, Instagram, Mail, MapPin, MessageCircle } from "lucide-react";
import { SiteShell, PageHeader } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { storeConfig, waLink } from "@/lib/store-config";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto · ViveroFlor" },
      {
        name: "description",
        content:
          "Escribinos por WhatsApp, mail o Instagram. Local en Rosario con retiro de pedidos sin costo.",
      },
      { property: "og:title", content: "Contacto · ViveroFlor" },
      { property: "og:description", content: "WhatsApp, mail, Instagram y dirección del vivero." },
    ],
  }),
  component: ContactoPage,
});

function ContactoPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Estamos para ayudarte"
        title="Contacto"
        subtitle="La vía más rápida es WhatsApp: respondemos dentro del horario del local."
      />

      <div className="container-page grid gap-8 py-12 lg:grid-cols-2">
        <div className="space-y-4">
          <ContactCard
            icon={<MessageCircle className="size-5 text-primary" />}
            title="WhatsApp"
            value={storeConfig.phone}
            href={waLink("¡Hola ViveroFlor! Quería hacerles una consulta.")}
            action="Abrir chat"
          />
          <ContactCard
            icon={<Mail className="size-5 text-primary" />}
            title="Email"
            value={storeConfig.email}
            href={`mailto:${storeConfig.email}`}
            action="Escribir mail"
          />
          <ContactCard
            icon={<Instagram className="size-5 text-primary" />}
            title="Instagram"
            value="@viveroflor"
            href={storeConfig.instagram}
            action="Ver perfil"
          />
        </div>

        <div className="rounded-2xl border border-border bg-cream p-6 shadow-soft">
          <h2 className="font-display text-xl font-semibold">El local</h2>
          <p className="mt-4 flex items-start gap-2 text-sm">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" /> {storeConfig.address}
          </p>
          <p className="mt-3 flex items-start gap-2 text-sm">
            <Clock className="mt-0.5 size-4 shrink-0 text-primary" /> {storeConfig.hours}
          </p>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Los pedidos con retiro por el local quedan listos el mismo día si los hacés antes de las
            16 h. Te avisamos por WhatsApp cuando podés pasar a buscarlo.
          </p>
          <Button asChild className="mt-5 w-full" size="lg">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeConfig.address)}`}
              target="_blank"
              rel="noreferrer"
            >
              Cómo llegar
            </a>
          </Button>
        </div>
      </div>
    </SiteShell>
  );
}

function ContactCard({
  icon,
  title,
  value,
  href,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  href: string;
  action: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="truncate text-sm text-muted-foreground">{value}</p>
      </div>
      <Button asChild variant="outline" size="sm">
        <a href={href} target="_blank" rel="noreferrer">
          {action}
        </a>
      </Button>
    </div>
  );
}
