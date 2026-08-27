import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CreditCard, Loader2, Lock, ShieldCheck, Store, Truck } from "lucide-react";
import { toast } from "sonner";
import { SiteShell, PageHeader } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/cart";
import { formatPrice, shippingCostFor, storeConfig } from "@/lib/store-config";
import { newOrderNumber, saveOrder, type Order, type ShippingMethod } from "@/lib/orders";
import { saveOrderFn } from "@/lib/orders-server";
import { createPreference, paymentMethods, type PaymentMethodId } from "@/lib/mercadopago";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout · ViveroFlor" },
      {
        name: "description",
        content: "Completá tus datos, elegí envío en Rosario o retiro por el local y pagá con Mercado Pago.",
      },
      { property: "og:title", content: "Checkout · ViveroFlor" },
      { property: "og:description", content: "Pago seguro con Mercado Pago, envío en Rosario o retiro por el local." },
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
  const [payment, setPayment] = useState<PaymentMethodId>("mercadopago");
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [loading, setLoading] = useState(false);

  const shipping = useMemo(() => shippingCostFor(subtotal, method), [subtotal, method]);
  const total = subtotal + shipping;
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const availablePayments = paymentMethods.filter(
    (m) => m.id !== "efectivo_local" || method === "pickup",
  );

  const validate = () => {
    const e: Partial<Record<keyof Form, string>> = {};
    if (!form.first_name.trim()) e.first_name = "Ingresá tu nombre";
    if (!form.last_name.trim()) e.last_name = "Ingresá tu apellido";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email inválido";
    if (form.phone.replace(/\D/g, "").length < 8) e.phone = "Teléfono inválido";
    if (method === "delivery") {
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
    const number = newOrderNumber();
    const order: Order = {
      id: crypto.randomUUID(),
      number,
      status: "pendiente",
      payment_status: "pendiente",
      customer: {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      },
      shipping_method: method,
      shipping_address:
        method === "delivery"
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
      total,
      payment_method: payment,
      notes: form.notes.trim() || undefined,
      created_at: new Date().toISOString(),
    };

    try {
      if (payment !== "efectivo_local") {
        const result = await createPreference({
          data: {
            orderNumber: number,
            items,
            shippingCost: shipping,
            shippingMethod: method,
            payer: {
              name: `${order.customer.first_name} ${order.customer.last_name}`,
              email: order.customer.email,
              phone: order.customer.phone,
            },
            successUrl: `${window.location.origin}/pedido/${number}`,
            failureUrl: `${window.location.origin}/compra-cancelada`,
          }
        });
        
        await saveOrderFn({ data: order });
        clear();
        
        // Redirigir a Mercado Pago
        window.location.href = result.init_point;
        return; // Detener ejecución aquí, el navegador cambiará de página
      } else {
        await saveOrderFn({ data: order });
        clear();
        navigate({ to: "/pedido/$number", params: { number } });
      }
    } catch {
      toast.error("No pudimos iniciar el pago", { description: "Intentá nuevamente en unos segundos." });
      navigate({ to: "/compra-cancelada" });
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
      <PageHeader eyebrow="Paso 2 de 3" title="Finalizar compra" subtitle="Datos de contacto, entrega y pago." />

      <form onSubmit={submit} className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="font-display text-lg font-semibold">1. Tus datos</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Nombre" error={errors.first_name}>
                <Input value={form.first_name} onChange={set("first_name")} autoComplete="given-name" />
              </Field>
              <Field label="Apellido" error={errors.last_name}>
                <Input value={form.last_name} onChange={set("last_name")} autoComplete="family-name" />
              </Field>
              <Field label="Email" error={errors.email}>
                <Input type="email" value={form.email} onChange={set("email")} autoComplete="email" />
              </Field>
              <Field label="Teléfono / WhatsApp" error={errors.phone}>
                <Input value={form.phone} onChange={set("phone")} inputMode="tel" placeholder="341 555 0198" />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="font-display text-lg font-semibold">2. Entrega</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <OptionCard
                selected={method === "delivery"}
                onSelect={() => setMethod("delivery")}
                icon={<Truck className="size-5 text-primary" />}
                title={storeConfig.shipping.deliveryLabel}
                description="Entregas de lunes a sábado, coordinamos horario por WhatsApp."
                price={
                  shippingCostFor(subtotal, "delivery") === 0
                    ? "Gratis"
                    : formatPrice(storeConfig.shipping.deliveryCost)
                }
              />
              <OptionCard
                selected={method === "pickup"}
                onSelect={() => {
                  setMethod("pickup");
                }}
                icon={<Store className="size-5 text-primary" />}
                title={storeConfig.shipping.pickupLabel}
                description={`${storeConfig.address} · ${storeConfig.hours}`}
                price="Gratis"
              />
            </div>

            {method === "delivery" && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Calle" error={errors.street}>
                  <Input value={form.street} onChange={set("street")} autoComplete="address-line1" />
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
                <Textarea rows={3} value={form.notes} onChange={set("notes")} placeholder="Timbre, referencia, horario preferido…" />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="font-display text-lg font-semibold">3. Pago</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              El pago se procesa con Mercado Pago. No guardamos datos de tu tarjeta.
            </p>
            <div className="mt-4 space-y-3">
              {availablePayments.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setPayment(m.id)}
                  className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                    payment === m.id ? "border-primary bg-secondary/60" : "border-border hover:bg-secondary/30"
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
                    <span className="mt-0.5 block text-sm text-muted-foreground">{m.description}</span>
                  </span>
                  <CreditCard className="mt-1 size-4 text-muted-foreground" />
                </button>
              ))}
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" /> Conexión segura · datos protegidos
            </p>
          </section>
        </div>

        <aside className="h-fit space-y-4 rounded-2xl border border-border bg-cream p-5 shadow-soft lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold">Tu pedido</h2>
          <ul className="space-y-3">
            {items.map((i) => (
              <li key={i.productId} className="flex items-center gap-3">
                <img src={i.image} alt={i.name} loading="lazy" className="size-14 rounded-lg object-cover" />
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
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {method === "pickup" ? storeConfig.shipping.pickupLabel : storeConfig.shipping.deliveryLabel}
              </span>
              <span className="font-medium">{shipping === 0 ? "Gratis" : formatPrice(shipping)}</span>
            </div>
          </div>
          <div className="flex justify-between border-t border-border pt-3 text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Redirigiendo a Mercado Pago…
              </>
            ) : (
              <>
                <Lock className="mr-2 size-4" />
                {payment === "efectivo_local" ? "Confirmar pedido" : "Pagar con Mercado Pago"}
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
  error?: string;
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
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  price: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex h-full flex-col gap-1 rounded-xl border p-4 text-left transition-colors ${
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
