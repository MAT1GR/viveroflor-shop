import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Leaf, MapPin, MessageCircle, Sprout, Store } from "lucide-react";
import { SiteShell, PageHeader } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { storeConfig, waLink } from "@/lib/store-config";

export const Route = createFileRoute("/nosotros")({
  head: () => ({
    meta: [
      { title: "Sobre nosotros · ViveroFlor" },
      {
        name: "description",
        content:
          "Somos un vivero de Rosario. Seleccionamos plantas sanas, macetas de diseño y acompañamos cada compra con asesoramiento de cuidado.",
      },
      { property: "og:title", content: "Sobre nosotros · ViveroFlor" },
      {
        property: "og:description",
        content: "Vivero en Rosario: plantas seleccionadas, macetas y asesoramiento.",
      },
    ],
  }),
  component: NosotrosPage,
});

const valores = [
  {
    icon: Sprout,
    title: "Plantas elegidas una por una",
    text: "Revisamos cada ejemplar antes de que salga del vivero: raíz sana, follaje firme y maceta acorde al tamaño.",
  },
  {
    icon: Leaf,
    title: "Asesoramiento incluido",
    text: "Cada compra viene con indicaciones de riego, luz y sustrato. Si algo no anda, escribinos y lo vemos juntos.",
  },
  {
    icon: Store,
    title: "Local a la calle",
    text: `Podés pasar por ${storeConfig.address} a ver todo en persona y retirar tus pedidos sin costo.`,
  },
];

function NosotrosPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Vivero en Rosario"
        title="Sobre nosotros"
        subtitle="Trabajamos con plantas todos los días y nos gusta que lleguen bien a tu casa."
      />

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        <div className="space-y-5 text-muted-foreground">
          <p className="text-lg leading-relaxed">
            {storeConfig.name} es un vivero de Rosario. Empezamos vendiendo plantas de interior a
            vecinos del barrio y hoy además armamos macetas, sustratos y todo lo que hace falta para
            que un espacio verde funcione.
          </p>
          <p className="leading-relaxed">
            La tienda online es una extensión del local: los mismos precios, el mismo stock y la
            misma gente atendiendo. Elegís desde el celular y lo recibís en tu casa dentro de
            Rosario o lo retirás por el local cuando te queda cómodo.
          </p>
          <p className="leading-relaxed">
            Si tenés dudas sobre qué planta va en un ambiente puntual, escribinos por WhatsApp con
            una foto del lugar. Preferimos recomendarte bien antes que venderte de más.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild size="lg">
              <Link to="/tienda">Ver la tienda</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a
                href={waLink("¡Hola ViveroFlor! Quería hacerles una consulta.")}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="mr-2 size-4" /> Escribirnos
              </a>
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <img
            src="/assets/hero-vivero.jpg"
            alt="Interior del vivero con plantas en estantes"
            width={1200}
            height={800}
            className="aspect-[4/3] w-full rounded-3xl object-cover shadow-lift"
          />
          <div className="rounded-2xl border border-border bg-cream p-5 text-sm shadow-soft">
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" /> {storeConfig.address}
            </p>
            <p className="mt-2 flex items-start gap-2">
              <Clock className="mt-0.5 size-4 shrink-0 text-primary" /> {storeConfig.hours}
            </p>
          </div>
        </div>
      </div>

      <section className="container-page pb-16">
        <div className="grid gap-5 sm:grid-cols-3">
          {valores.map((v) => (
            <div key={v.title} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-primary">
                <v.icon className="size-5" />
              </span>
              <h2 className="mt-4 font-display text-lg font-semibold">{v.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
