/**
 * Capa de pago.
 *
 * No hay cobro online: el pedido se registra en la base (que ya descuenta el
 * stock) y el cliente cierra la compra por WhatsApp, donde se coordina la
 * forma de pago y la entrega. `buildOrderWhatsAppMessage` arma el mensaje con
 * todo el detalle del pedido para que el vivero no tenga que preguntar nada.
 */
import type { CartItem } from "./cart";
import type { Order, ShippingMethod } from "./orders";
import { formatPrice, storeConfig } from "./store-config";

export type PaymentMethodId = "whatsapp" | "efectivo_local";

export type PaymentMethodOption = {
  id: PaymentMethodId;
  label: string;
  description: string;
  badge?: string;
};

export const paymentMethods: PaymentMethodOption[] = [
  {
    id: "whatsapp",
    label: "Coordinar por WhatsApp",
    description:
      "Te pasamos los datos para transferir o abonás al recibir el pedido. Lo confirmamos por chat.",
    badge: "Recomendado",
  },
  {
    id: "efectivo_local",
    label: "Efectivo al retirar",
    description: "Sólo con retiro por el local. Abonás cuando pasás a buscar el pedido.",
  },
];

export const paymentMethodLabel = (id: PaymentMethodId) =>
  paymentMethods.find((m) => m.id === id)?.label ?? "Coordinar por WhatsApp";

export type OrderMessageInput = {
  orderNumber: string;
  customer: Order["customer"];
  shippingMethod: ShippingMethod;
  shippingAddress: Order["shipping_address"];
  paymentMethod: PaymentMethodId;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  notes?: string | undefined;
};

const addressLine = (address: NonNullable<Order["shipping_address"]>) =>
  [
    [address.street, address.number].filter(Boolean).join(" "),
    address.apartment,
    address.neighborhood,
    address.city,
  ]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");

/** Mensaje de WhatsApp con el pedido completo, listo para `waLink`. */
export function buildOrderWhatsAppMessage(order: OrderMessageInput) {
  const lines: string[] = [
    `Hola ${storeConfig.name}! Quiero confirmar este pedido 🌿`,
    "",
    `*Pedido:* ${order.orderNumber}`,
    `*Nombre:* ${order.customer.first_name} ${order.customer.last_name}`,
    `*Email:* ${order.customer.email}`,
    `*Teléfono:* ${order.customer.phone}`,
    "",
    "*Productos*",
    ...order.items.map(
      (item) => `• ${item.quantity} × ${item.name} — ${formatPrice(item.price * item.quantity)}`,
    ),
    "",
    `*Entrega:* ${
      order.shippingMethod === "delivery"
        ? storeConfig.shipping.deliveryLabel
        : storeConfig.shipping.pickupLabel
    }`,
  ];

  if (order.shippingMethod === "delivery" && order.shippingAddress) {
    lines.push(`*Dirección:* ${addressLine(order.shippingAddress)}`);
  } else {
    lines.push(`*Retiro en:* ${storeConfig.address}`);
  }

  if (order.notes) lines.push(`*Notas:* ${order.notes}`);

  lines.push(
    "",
    `*Subtotal:* ${formatPrice(order.subtotal)}`,
    ...(order.discount > 0
      ? [`*Descuento ${storeConfig.promo.percent}% efectivo:* -${formatPrice(order.discount)}`]
      : []),
    `*Envío:* ${order.shippingCost === 0 ? "Gratis" : formatPrice(order.shippingCost)}`,
    `*Total:* ${formatPrice(order.total)}`,
    "",
    `*Forma de pago:* ${paymentMethodLabel(order.paymentMethod)}`,
  );

  return lines.join("\n");
}
