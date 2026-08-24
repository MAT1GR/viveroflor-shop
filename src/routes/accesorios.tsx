import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHeader } from "@/components/site/SiteShell";
import { ShopView } from "@/components/site/ShopView";

export const Route = createFileRoute("/accesorios")({
  head: () => ({
    meta: [
      { title: "Accesorios de jardinería · ViveroFlor" },
      {
        name: "description",
        content: "Sustratos, regaderas y herramientas para cuidar tus plantas todo el año.",
      },
      { property: "og:title", content: "Accesorios · ViveroFlor" },
      { property: "og:description", content: "Sustratos, herramientas y todo para el cuidado." },
    ],
  }),
  component: Accesorios,
});

function Accesorios() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Cuidado"
        title="Accesorios"
        subtitle="Todo lo que necesitás para trasplantar, regar y mantener tus plantas."
      />
      <ShopView fixedCategory="accesorios" />
    </SiteShell>
  );
}
