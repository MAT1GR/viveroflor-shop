import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Info,
  Loader2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { SiteShell, PageHeader } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/cart";
import {
  canDeliver,
  formatPrice,
  formatPromoEnd,
  getActivePromo,
  missingForDelivery,
  promoDiscountFor,
  shippingCostFor,
  storeConfig,
  waLink,
} from "@/lib/store-config";
import type { Order, ShippingMethod } from "@/lib/orders";
import { saveOrderFn } from "@/lib/orders-server";
import { buildOrderWhatsAppMessage, paymentMethods, type PaymentMethodId } from "@/lib/payments";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout · ViveroFlor" },
      {
        name: "description",
        content:
          "Completá tus datos, elegí envío en Rosario o retiro por el local y confirmá tu pedido por WhatsApp.",
      },
      { property: "og:title", content: "Checkout · ViveroFlor" },
      {
        property: "og:description",
        content: "Confirmás tu pedido por WhatsApp, con envío en Rosario o retiro por el local.",
      },
    ],
  }),
  component: CheckoutPage,
});

type Form = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  street: string;
  number: string;
  apartment: string;
  neighborhood: string;
  city: string;
  notes: string;
};

const emptyForm: Form = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  street: "",
  number: "",
  apartment: "",
  neighborhood: "",
  city: "Rosario",
  notes: "",
};

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clear } = useCart();
  const [form, setForm] = useState<Form>(emptyForm);
  const [method, setMethod] = useState<ShippingMethod>("delivery");
  const [payment, setPayment] = useState<PaymentMethodId>("whatsapp");
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [loading, setLoading] = useState(false);

  const deliveryAvailable = canDeliver(subtotal);
  const missing = missingForDelivery(subtotal);

  // Debajo de la compra mínima sólo queda el retiro por el local.
  const effectiveMethod: ShippingMethod = deliveryAvailable ? method : "pickup";

  const promo = useMemo(() => getActivePromo(), []);
  const shipping = useMemo(
    () => shippingCostFor(subtotal, effectiveMethod),
    [subtotal, effectiveMethod],
  );
  const discount = useMemo(() => promoDiscountFor(subtotal, payment), [subtotal, payment]);
  const total = subtotal - discount + shipping;
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const availablePayments = paymentMethods.filter(
    (m) => m.id !== "efectivo_local" || effectiveMethod === "pickup",
  );

  // Si el método elegido dejó de estar disponible, volvemos al de WhatsApp.
  useEffect(() => {
    if (!availablePayments.some((m) => m.id === payment)) setPayment("whatsapp");
  }, [availablePayments, payment]);

  const validate = () => {
    const e: Partial<Record<keyof Form, string>> = {};
    if (!form.first_name.trim()) e.first_name = "Ingresá tu nombre";
    if (!form.last_name.trim()) e.last_name = "Ingresá tu apellido";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email inválido";
    if (form.phone.replace(/\D/g, "").length < 8) e.phone = "Teléfono inválido";
    if (effectiveMethod === "delivery") {
      if (!form.street.trim()) e.street = "Ingresá la calle";
      if (!form.number.trim()) e.number = "Ingresá la altura";
      if (!form.city.trim()) e.city = "Ingresá la ciudad";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (items.length === 0) return;
    if (!validate()) {
      toast.error("Revisá los datos", { description: "Hay campos incompletos en el formulario." });
      return;
    }

    setLoading(true);
    // `number`, importes y estados los define el servidor; acá sólo mandamos
    // los datos del cliente y el carrito.
    const order: Order = {
      id: crypto.randomUUID(),
      number: "",
      status: "pendiente",
      payment_status: "pendiente",
      customer: {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      },
      shipping_method: effectiveMethod,
      shipping_address:
        effectiveMethod === "delivery"
          ? {
              street: form.street.trim(),
              number: form.number.trim(),
              apartment: form.apartment.trim(),
              neighborhood: form.neighborhood.trim(),
              city: form.city.trim(),
            }
          : null,
      items,
      subtotal,
      shipping_cost: shipping,
      discount,
      total,
      payment_method: payment,
      ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      // Guardar el pedido ya descuenta el stock, así que es lo primero:
      // si una planta se agotó recién, falla acá y no llegamos a mandar nada.
      // Los importes que devuelve el servidor son los que valen: el mensaje de
      // WhatsApp se arma con esos, no con los calculados en el navegador.
      const priced = await saveOrderFn({ data: order });

      const message = buildOrderWhatsAppMessage({
        orderNumber: priced.number,
        customer: order.customer,
        shippingMethod: order.shipping_method,
        shippingAddress: order.shipping_address,
        paymentMethod: payment,
        items: priced.items,
        subtotal: priced.subtotal,
        discount: priced.discount,
        shippingCost: priced.shipping_cost,
        total: priced.total,
        notes: order.notes,
      });

      clear();
      // Abrimos WhatsApp en otra pestaña y dejamos al cliente en el detalle del
      // pedido, así no pierde el número si vuelve al navegador.
      window.open(waLink(message), "_blank", "noopener,noreferrer");
      navigate({ to: "/pedido/$number", params: { number: priced.number } });
    } catch (err) {
      toast.error("No pudimos confirmar el pedido", {
        description:
          err instanceof Error && err.message
            ? err.message
            : "Intentá nuevamente en unos segundos.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <SiteShell>
        <PageHeader title="Checkout" subtitle="Necesitás productos en el carrito para continuar." />
        <div className="container-page py-12 text-center">
          <Button asChild size="lg">
            <Link to="/tienda">Ver la tienda</Link>
          </Button>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Paso 2 de 3"
        title="Finalizar compra"
        subtitle="Datos de contacto, entrega y pago."
      />

      <form onSubmit={submit} className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="font-display text-lg font-semibold">1. Tus datos</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Nombre" error={errors.first_name}>
                <Input
                  value={form.first_name}
                  onChange={set("first_name")}
                  autoComplete="given-name"
                />
              </Field>
              <Field label="Apellido" error={errors.last_name}>
                <Input
                  value={form.last_name}
                  onChange={set("last_name")}
                  autoComplete="family-name"
                />
              </Field>
              <Field label="Email" error={errors.email}>
                <Input
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  autoComplete="email"
                />
              </Field>
              <Field label="Teléfono / WhatsApp" error={errors.phone}>
                <Input
                  value={form.phone}
                  onChange={set("phone")}
                  inputMode="tel"
                  placeholder="341 555 1588"
                />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="font-display text-lg font-semibold">2. Entrega</h2>
            {!deliveryAvailable && (
              <p className="mt-3 flex items-start gap-2 rounded-xl bg-secondary p-3 text-sm">
                <Info className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  El envío a domicilio requiere una compra mínima de{" "}
                  <strong>{formatPrice(storeConfig.shipping.minOrderForDelivery)}</strong>. Te
                  faltan <strong>{formatPrice(missing)}</strong> — mientras tanto podés retirar por
                  el local sin cargo.
                </span>
              </p>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <OptionCard
                selected={effectiveMethod === "delivery"}
                disabled={!deliveryAvailable}
                onSelect={() => setMethod("delivery")}
                icon={<Truck className="size-5 text-primary" />}
                title={storeConfig.shipping.deliveryLabel}
                description={
                  deliveryAvailable
                    ? "Entregas de lunes a sábado, coordinamos horario por WhatsApp."
                    : `Disponible desde ${formatPrice(storeConfig.shipping.minOrderForDelivery)} de compra.`
                }
                price={formatPrice(storeConfig.shipping.deliveryCost)}
              />
              <OptionCard
                selected={effectiveMethod === "pickup"}
                onSelect={() => setMethod("pickup")}
                icon={<Store className="size-5 text-primary" />}
                title={storeConfig.shipping.pickupLabel}
                description={`${storeConfig.address} · ${storeConfig.hours}`}
                price="Gratis"
              />
            </div>

            {effectiveMethod === "delivery" && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Calle" error={errors.street}>
                  <Input
                    value={form.street}
                    onChange={set("street")}
                    autoComplete="address-line1"
                  />
                </Field>
                <Field label="Altura" error={errors.number}>
                  <Input value={form.number} onChange={set("number")} />
                </Field>
                <Field label="Piso / Depto (opcional)">
                  <Input value={form.apartment} onChange={set("apartment")} />
                </Field>
                <Field label="Barrio (opcional)">
                  <Input value={form.neighborhood} onChange={set("neighborhood")} />
                </Field>
                <Field label="Ciudad" error={errors.city}>
                  <Input value={form.city} onChange={set("city")} />
                </Field>
              </div>
            )}

            <div className="mt-4">
              <Field label="Notas para la entrega (opcional)">
                <Textarea
                  rows={3}
                  value={form.notes}
                  onChange={set("notes")}
                  placeholder="Timbre, referencia, horario preferido…"
                />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="font-display text-lg font-semibold">3. Pago</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              No cobramos online: al confirmar te abrimos WhatsApp con el detalle del pedido y
              coordinamos el pago por ahí.
            </p>
            {promo && (
              <p className="mt-3 flex items-start gap-2 rounded-xl bg-secondary p-3 text-sm">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  <strong>{promo.shortLabel}</strong> hasta el {formatPromoEnd(promo.endsOn)}. Se
                  aplica al elegir <em>Efectivo al retirar</em>.
                </span>
              </p>
            )}
            <div className="mt-4 space-y-3">
              {availablePayments.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setPayment(m.id)}
                  className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                    payment === m.id
                      ? "border-primary bg-secondary/60"
                      : "border-border hover:bg-secondary/30"
                  }`}
                >
                  <span
                    className={`mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border-2 ${
                      payment === m.id ? "border-primary" : "border-muted-foreground/40"
                    }`}
                  >
                    {payment === m.id && <span className="size-2 rounded-full bg-primary" />}
                  </span>
                  <span className="flex-1">
                    <span className="flex items-center gap-2 font-medium">
                      {m.label}
                      {m.badge && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                          {m.badge}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">
                      {m.description}
                    </span>
                  </span>
                  <MessageCircle className="mt-1 size-4 text-muted-foreground" />
                </button>
              ))}
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" /> No pedimos datos de tarjeta en la web
            </p>
          </section>
        </div>

        <aside className="h-fit space-y-4 rounded-2xl border border-border bg-cream p-5 shadow-soft lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold">Tu pedido</h2>
          <ul className="space-y-3">
            {items.map((i) => (
              <li key={i.productId} className="flex items-center gap-3">
                <img
                  src={i.image}
                  alt={i.name}
                  loading="lazy"
                  className="size-14 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{i.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {i.quantity} × {formatPrice(i.price)}
                  </p>
                </div>
                <span className="text-sm font-semibold">{formatPrice(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-2 border-t border-border pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-primary">
                <span>Descuento {storeConfig.promo.percent}% efectivo</span>
                <span className="font-medium">-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {effectiveMethod === "pickup"
                  ? storeConfig.shipping.pickupLabel
                  : storeConfig.shipping.deliveryLabel}
              </span>
              <span className="font-medium">
                {shipping === 0 ? "Gratis" : formatPrice(shipping)}
              </span>
            </div>
          </div>
          <div className="flex justify-between border-t border-border pt-3 text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Preparando tu pedido…
              </>
            ) : (
              <>
                <MessageCircle className="mr-2 size-4" /> Confirmar pedido por WhatsApp
              </>
            )}
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link to="/carrito">
              <ArrowLeft className="mr-2 size-4" /> Volver al carrito
            </Link>
          </Button>
        </aside>
      </form>
    </SiteShell>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function OptionCard({
  selected,
  onSelect,
  icon,
  title,
  description,
  price,
  disabled = false,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  price: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-disabled={disabled}
      className={`flex h-full flex-col gap-1 rounded-xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${
        selected ? "border-primary bg-secondary/60" : "border-border hover:bg-secondary/30"
      }`}
    >
      <span className="flex items-center gap-2 font-medium">
        {icon}
        {title}
      </span>
      <span className="text-sm text-muted-foreground">{description}</span>
      <span className="mt-1 text-sm font-semibold text-primary">{price}</span>
    </button>
  );
}
