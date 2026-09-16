import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHeader } from "@/components/site/SiteShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatPrice, storeConfig } from "@/lib/store-config";

export const Route = createFileRoute("/preguntas-frecuentes")({
  head: () => ({
    meta: [
      { title: "Preguntas frecuentes · ViveroFlor" },
      {
        name: "description",
        content:
          "Envíos en Rosario, medios de pago, retiro por el local, cambios y cuidado de las plantas.",
      },
      { property: "og:title", content: "Preguntas frecuentes · ViveroFlor" },
      {
        property: "og:description",
        content: "Todo sobre envíos, pagos y cuidados antes de comprar.",
      },
    ],
  }),
  component: FaqPage,
});

type Section = { id: string; title: string; items: { q: string; a: string }[] };

const sections: Section[] = [
  {
    id: "envios",
    title: "Envíos y retiro",
    items: [
      {
        q: "¿Cuánto cuesta el envío?",
        a: `El envío dentro de Rosario tiene un costo fijo de ${formatPrice(storeConfig.shipping.deliveryCost)}. Para poder despacharlo necesitamos una compra mínima de ${formatPrice(storeConfig.shipping.minOrderForDelivery)} en productos.`,
      },
      {
        q: "¿Y si mi pedido es más chico que la compra mínima?",
        a: `Podés completarlo hasta llegar a ${formatPrice(storeConfig.shipping.minOrderForDelivery)}, o elegir retiro por el local, que es sin costo y no tiene monto mínimo.`,
      },
      {
        q: "¿Cuánto tarda en llegar?",
        a: "Entregamos de lunes a sábado dentro de Rosario. Coordinamos día y franja horaria por WhatsApp apenas confirmamos el pedido.",
      },
      {
        q: "¿Hacen envíos fuera de Rosario?",
        a: "Por ahora no. Si estás en la zona escribinos por WhatsApp y vemos caso por caso.",
      },
      {
        q: "¿Cómo retiro por el local?",
        a: `Pasás por ${storeConfig.address} en el horario de atención (${storeConfig.hours}). Te avisamos por WhatsApp cuando el pedido está armado.`,
      },
    ],
  },
  {
    id: "pagos",
    title: "Medios de pago",
    items: [
      {
        q: "¿Con qué puedo pagar?",
        a: "Transferencia bancaria, efectivo al retirar por el local o al recibir el envío. Al confirmar el pedido te abrimos WhatsApp con el detalle y ahí te pasamos los datos para pagar.",
      },
      {
        q: "¿Hay descuento pagando en efectivo?",
        a: `Sí. Una semana por mes hacemos ${storeConfig.promo.percent}% de descuento abonando en efectivo al retirar por el local. Cuando la promo está activa aparece anunciada arriba de todo en la web y el descuento se aplica solo en el checkout.`,
      },
      {
        q: "¿Tengo que cargar datos de tarjeta en la web?",
        a: "No. En la web no se cobra nada: sólo se registra el pedido. El pago se coordina después por WhatsApp, así que nunca te pedimos datos de tarjeta acá.",
      },
      {
        q: "¿Qué pasa después de confirmar el pedido?",
        a: "Se te abre WhatsApp con el detalle completo (número de pedido, productos, envío y total). Nos escribís, te confirmamos disponibilidad y coordinamos el pago y la entrega.",
      },
    ],
  },
  {
    id: "pedidos",
    title: "Pedidos y cambios",
    items: [
      {
        q: "¿Cómo sé en qué estado está mi pedido?",
        a: "Al confirmar la compra te mostramos el número de pedido y te escribimos por WhatsApp en cada paso: preparación, listo para retirar o en camino.",
      },
      {
        q: "¿Puedo cambiar o cancelar un pedido?",
        a: "Sí, mientras no haya salido para entrega. Escribinos por WhatsApp con el número de pedido y lo resolvemos.",
      },
      {
        q: "¿Qué pasa si la planta llega dañada?",
        a: "Avisanos dentro de las 48 horas con una foto y la cambiamos o te devolvemos el importe.",
      },
    ],
  },
  {
    id: "cuidados",
    title: "Cuidado de las plantas",
    items: [
      {
        q: "¿Cómo sé qué planta va en mi casa?",
        a: "Cada producto indica luz, riego y tamaño. Si tenés dudas, mandanos una foto del lugar por WhatsApp y te recomendamos.",
      },
      {
        q: "¿Las plantas vienen con maceta?",
        a: "Vienen en su maceta de cultivo. Las macetas decorativas se venden por separado en la sección Macetas.",
      },
      {
        q: "¿Hacen trasplantes?",
        a: "Sí, en el local. Si comprás la planta y la maceta juntas te la dejamos trasplantada sin cargo.",
      },
    ],
  },
];

function FaqPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Ayuda"
        title="Preguntas frecuentes"
        subtitle="Envíos, pagos y cuidados. Si algo no está acá, escribinos por WhatsApp."
      />

      <div className="container-page max-w-3xl space-y-10 py-12">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-24">
            <h2 className="font-display text-2xl font-semibold">{section.title}</h2>
            <Accordion type="single" collapsible className="mt-3">
              {section.items.map((item, i) => (
                <AccordionItem key={item.q} value={`${section.id}-${i}`}>
                  <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}
      </div>
    </SiteShell>
  );
}
