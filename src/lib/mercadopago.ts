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

import { createServerFn } from "@tanstack/react-start";
import { MercadoPagoConfig, Preference } from "mercadopago";

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
 * Server function to create a Mercado Pago preference
 */
export const createPreference = createServerFn({ method: "POST" })
  .validator((input: PreferenceInput) => input)
  .handler(async ({ data: input }) => {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) {
      throw new Error("MERCADOPAGO_ACCESS_TOKEN is not defined");
    }

    const client = new MercadoPagoConfig({ accessToken: token });
    const preference = new Preference(client);

    try {
      const result = await preference.create({
        body: {
          items: input.items.map((item) => ({
            id: item.productId,
            title: item.name,
            quantity: item.quantity,
            unit_price: item.price,
          })),
          payer: {
            name: input.payer.name,
            email: input.payer.email,
            phone: {
              number: input.payer.phone,
            },
          },
          shipments: {
            cost: input.shippingCost,
          },
          back_urls: {
            success: input.successUrl,
            failure: input.failureUrl,
            pending: input.successUrl,
          },
          auto_return: "approved",
          external_reference: input.orderNumber,
        },
      });

      return {
        preference_id: result.id!,
        init_point: process.env.NODE_ENV === "production" ? result.init_point! : result.sandbox_init_point!,
        sandbox: process.env.NODE_ENV !== "production",
      };
    } catch (error) {
      console.error("Error creating Mercado Pago preference:", error);
      throw error;
    }
  });
