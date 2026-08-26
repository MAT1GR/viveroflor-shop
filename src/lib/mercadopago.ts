/**
 * Capa de pago (Mercado Pago).
 *
 * Estructura lista para conectar con el backend: cuando exista la función
 * de servidor `crear-preferencia` (con MP_ACCESS_TOKEN), sólo hay que
 * reemplazar el cuerpo de `createPreference` por el fetch a ese endpoint y
 * redirigir a `init_point`.
 */
import type { CartItem } from "./cart";
import type { ShippingMethod } from "./orders";

export type PaymentMethodId = "mercadopago" | "mercadopago_transferencia" | "efectivo_local";

export type PaymentMethodOption = {
  id: PaymentMethodId;
  label: string;
  description: string;
  badge?: string;
  requiresRedirect: boolean;
};

export const paymentMethods: PaymentMethodOption[] = [
  {
    id: "mercadopago",
    label: "Mercado Pago",
    description: "Tarjeta de crédito, débito o dinero en cuenta. Hasta 12 cuotas.",
    badge: "Recomendado",
    requiresRedirect: true,
  },
  {
    id: "mercadopago_transferencia",
    label: "Transferencia / Dinero en cuenta",
    description: "Pagás con transferencia desde Mercado Pago y confirmamos el pedido al acreditarse.",
    requiresRedirect: true,
  },
  {
    id: "efectivo_local",
    label: "Efectivo al retirar",
    description: "Sólo con retiro por el local. Abonás cuando pasás a buscar el pedido.",
    requiresRedirect: false,
  },
];

export const paymentMethodLabel = (id: PaymentMethodId) =>
  paymentMethods.find((m) => m.id === id)?.label ?? "Mercado Pago";

export type PreferenceInput = {
  orderNumber: string;
  items: CartItem[];
  shippingCost: number;
  shippingMethod: ShippingMethod;
  payer: { name: string; email: string; phone: string };
  successUrl: string;
  failureUrl: string;
};

export type PreferenceResult = {
  preference_id: string;
  init_point: string;
  sandbox: boolean;
};

/**
 * Simulación del checkout de Mercado Pago mientras no hay backend.
 * Devuelve la URL de retorno de éxito para continuar el flujo.
 */
export async function createPreference(input: PreferenceInput): Promise<PreferenceResult> {
  await new Promise((r) => setTimeout(r, 900));
  return {
    preference_id: `pref-${input.orderNumber}`,
    init_point: input.successUrl,
    sandbox: true,
  };
}
